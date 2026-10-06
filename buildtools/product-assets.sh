#!/usr/bin/env bash
#
# Generate a product's derived image assets with ImageMagick.
#
#   buildtools/product-assets.sh <source-image> --product <id> [options]
#   buildtools/product-assets.sh --all [--dry-run]
#
# Given a source image and a product id it writes, into public/images/<id>/:
#
#   <name>.webp        product hero / product-card background
#   <name>-og.png      OG background, truecolor PNG
#   <name>-og.webp     OG background
#   <name>.jpg         1920x1080 16:9 master, only with --master or a profile that has one
#
# Examples:
#   buildtools/product-assets.sh ~/Desktop/Servers-v2.jpg --product maid-kit
#   buildtools/product-assets.sh shot.png --product goatcraft --hero 1920x1080 --og 1200x675
#   buildtools/product-assets.sh --all --dry-run
#
# Defaults, most specific first:
#   name / hero crop / hero size / og size / qualities
#     flags > product profile table > existing assets in the product dir
#     > source size for the hero, 1200x675 for the OG, 85/86/92 for the qualities
#
# Profile crops are stored in source pixels against the profile's own reference
# source and are rescaled proportionally when the supplied source has different
# dimensions, so a re-export at another resolution keeps the same framing.
#
# Options:
#   --product ID        product id -> output directory (required unless --all)
#   --name BASE         output basename
#   --hero WxH          hero size ('-' keeps the source size)
#   --hero-crop GEOM    crop the source first: WxH+X+Y, or '-' for none
#   --og WxH            OG size
#   --master            also write the 1920x1080 16:9 <name>.jpg
#   --master-crop GEOM  crop for the master first (default: none)
#   --hero-q N          hero WebP quality
#   --og-q N            OG WebP quality
#   --jpg-q N           master JPEG quality
#   -n, --dry-run       print the magick commands instead of running them
#   -h, --help          this text
#
# Every requested size is filled exactly: the source is scaled to cover, then
# centre-cropped. The markup hardcodes width/height, so outputs never drift.
#
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_ROOT="${IMAGE_ROOT:-$ROOT/public/images}"
FILTER="${FILTER:-Lanczos}"

# Per-product geometry and encoding.
# Columns: key | dir | name | reference source | hero crop | hero size | og size | master crop | hero q | og q | jpg q
# '-' means: default name / no crop / keep the source size / no master / default quality.
PROFILES=$(cat <<'EOF'
maid-kit      | maid-kit         | main-visual | maid-kit/Servers.jpg           | 2880x1041+0+484 | 1920x694 | 1200x675 | 2880x1620+0+0   | 85 | 82 | 92
solar-network | solar-network    | main-visual | solar-network/main-visual.png  | -               | -        | 1200x600 | -               | 95 | 86 | -
roy-filling   | republic-of-yang | greatwall   | republic-of-yang/greatwall.png | -               | -        | 1200x600 | -               | 92 | 86 | -
hero          | hero             | background  | hero/background.png            | -               | -        | 900x600  | -               | 91 | 90 | -
EOF
)

SRC=""; PRODUCT=""; ALL=0; DRY=0; MASTER=0
OPT_NAME=""; OPT_HCROP=""; OPT_HSIZE=""; OPT_OG=""; OPT_MCROP=""
OPT_HQ=""; OPT_OQ=""; OPT_JQ=""

while [ $# -gt 0 ]; do
  case "$1" in
    --product)     PRODUCT="${2:?--product needs an id}"; shift ;;
    --name)        OPT_NAME="${2:?--name needs a value}"; shift ;;
    --hero)        OPT_HSIZE="${2:?--hero needs WxH}"; shift ;;
    --hero-crop)   OPT_HCROP="${2:?--hero-crop needs a geometry}"; shift ;;
    --og)          OPT_OG="${2:?--og needs WxH}"; shift ;;
    --master)      MASTER=1 ;;
    --master-crop) OPT_MCROP="${2:?--master-crop needs a geometry}"; shift ;;
    --hero-q)      OPT_HQ="${2:?--hero-q needs a number}"; shift ;;
    --og-q)        OPT_OQ="${2:?--og-q needs a number}"; shift ;;
    --jpg-q)       OPT_JQ="${2:?--jpg-q needs a number}"; shift ;;
    --all)         ALL=1 ;;
    -n|--dry-run)  DRY=1 ;;
    -h|--help)     awk 'NR>1 && /^#/ {sub(/^# ?/,""); print; next} NR>1 {exit}' "$0"; exit 0 ;;
    -*)            echo "unknown option: $1" >&2; exit 2 ;;
    *)             SRC="$1" ;;
  esac
  shift
done

command -v magick >/dev/null 2>&1 || { echo "error: ImageMagick 7 (magick) not found" >&2; exit 1; }

trim()  { local s="$1"; s="${s#"${s%%[![:space:]]*}"}"; s="${s%"${s##*[![:space:]]}"}"; printf '%s' "$s"; }
dims()  { magick identify -format '%w %h' "$1[0]"; }
sizes() { magick identify -format '%wx%h' "$1[0]"; }

scale_geom() { # <WxH+X+Y> <sx> <sy>
  printf '%s\n' "$1" | awk -F'[x+]' -v sx="$2" -v sy="$3" \
    '{printf "%dx%d+%d+%d", int($1*sx+0.5), int($2*sy+0.5), int($3*sx+0.5), int($4*sy+0.5)}'
}

PROF_DIR=""; PROF_NAME=""; PROF_SRC=""; PROF_HCROP=""; PROF_HSIZE=""
PROF_OGSIZE=""; PROF_MCROP=""; PROF_HQ=""; PROF_OQ=""; PROF_JQ=""
profile_lookup() {
  PROF_DIR=""; PROF_NAME=""; PROF_SRC=""; PROF_HCROP=""; PROF_HSIZE=""
  PROF_OGSIZE=""; PROF_MCROP=""; PROF_HQ=""; PROF_OQ=""; PROF_JQ=""
  local line
  # OFS must be '|': touching $1 rebuilds $0, which would otherwise be re-joined with spaces
  line=$(printf '%s\n' "$PROFILES" | awk -F'|' -v OFS='|' -v k="$1" '{gsub(/^[ \t]+|[ \t]+$/,"",$1); if ($1==k) {print; exit}}')
  [ -n "$line" ] || return 0
  IFS='|' read -r _ dir name src hc hs os mc hq oq jq <<<"$line"
  PROF_DIR=$(trim "$dir");    PROF_NAME=$(trim "$name");  PROF_SRC=$(trim "$src")
  PROF_HCROP=$(trim "$hc");   PROF_HSIZE=$(trim "$hs");   PROF_OGSIZE=$(trim "$os")
  PROF_MCROP=$(trim "$mc");   PROF_HQ=$(trim "$hq");      PROF_OQ=$(trim "$oq")
  PROF_JQ=$(trim "$jq")
}

# resolve the effective name/qualities: flag > profile > built-in default
NAME=""; HERO_Q=""; OG_Q=""; JPG_Q=""
resolve() {
  NAME="${OPT_NAME:-${PROF_NAME:-main-visual}}"
  [ "$NAME" = "-" ] && NAME=main-visual
  HERO_Q="${OPT_HQ:-${PROF_HQ:-}}"; [ -n "$HERO_Q" ] && [ "$HERO_Q" != "-" ] || HERO_Q=85
  OG_Q="${OPT_OQ:-${PROF_OQ:-}}";   [ -n "$OG_Q" ]   && [ "$OG_Q"   != "-" ] || OG_Q=86
  JPG_Q="${OPT_JQ:-${PROF_JQ:-}}";  [ -n "$JPG_Q" ]  && [ "$JPG_Q"  != "-" ] || JPG_Q=92
}

# build <source abs> <crop> <size> <encode> <out>
build() {
  local in_path="$1" crop="$2" size="$3" enc="$4" out="$5"
  local args=("$in_path[0]")
  case "$crop" in ""|-|cover) ;; *) args+=(-crop "$crop" +repage) ;; esac
  # any requested size fills exactly: scale to cover, then centre-crop.
  # (the markup hardcodes width/height, so the output must not drift by a pixel)
  if [ -n "$size" ] && [ "$size" != "-" ]; then
    args+=(-filter "$FILTER" -resize "${size}^" -gravity center -extent "$size")
  fi
  case "$enc" in
    png)           args+=(-strip -define png:compression-level=9) ;;
    jpeg:*)        args+=(-strip -quality "${enc#jpeg:}" -sampling-factor 2x1) ;;
    webp:lossless) args+=(-strip -define webp:lossless=true -define webp:method=6) ;;
    webp:*)        args+=(-strip -quality "${enc#webp:}" -define webp:method=6) ;;
    *) echo "error: unknown encoder '$enc'" >&2; exit 1 ;;
  esac
  args+=("$out")
  if [ "$DRY" = 1 ]; then
    printf 'magick %s\n' "${args[*]}"
  else
    mkdir -p "$(dirname "$out")"
    magick "${args[@]}"
    printf '  %-38s %s\n' "${out#"$IMAGE_ROOT"/}" "$(magick identify -format '%wx%h %m %b' "$out")"
  fi
}

# generate <profile-key> <dir> <source abs> <hero crop> <hero size> <og size> <master crop>
generate() {
  local key="$1" dir="$2" in_path="$3"
  local hero_crop="$4" hero_size="$5" og_size="$6" master_crop="$7"
  [ -f "$in_path" ] || { echo "error: source image not found: $in_path" >&2; exit 1; }

  # rescale the profile's crops when the supplied source is not the reference one
  if [ -n "$PROF_SRC" ] && [ -f "$IMAGE_ROOT/$PROF_SRC" ] && [ "$IMAGE_ROOT/$PROF_SRC" != "$in_path" ]; then
    read -r rw rh <<<"$(dims "$IMAGE_ROOT/$PROF_SRC")"
    read -r nw nh <<<"$(dims "$in_path")"
    if [ "$nw" != "$rw" ] || [ "$nh" != "$rh" ]; then
      local sx sy
      sx=$(awk -v a="$nw" -v b="$rw" 'BEGIN{print a/b}')
      sy=$(awk -v a="$nh" -v b="$rh" 'BEGIN{print a/b}')
      echo "note: source ${nw}x${nh} vs reference ${rw}x${rh} -> rescaling crops by ${sx}x${sy}"
      case "$hero_crop"   in ""|-|cover) ;; *) hero_crop=$(scale_geom "$hero_crop" "$sx" "$sy") ;; esac
      case "$master_crop" in ""|-|cover) ;; *) master_crop=$(scale_geom "$master_crop" "$sx" "$sy") ;; esac
    fi
  fi

  echo "$dir/$NAME: hero ${hero_size} / crop ${hero_crop:--} / og ${og_size} / q ${HERO_Q}/${OG_Q}"
  build "$in_path" "$hero_crop" "$hero_size" "webp:$HERO_Q" "$IMAGE_ROOT/$dir/$NAME.webp"
  build "$in_path" cover "$og_size" png "$IMAGE_ROOT/$dir/$NAME-og.png"
  build "$in_path" cover "$og_size" "webp:$OG_Q" "$IMAGE_ROOT/$dir/$NAME-og.webp"
  if [ -n "$master_crop" ] && [ "$master_crop" != "-" ]; then
    build "$in_path" "$master_crop" 1920x1080 "jpeg:$JPG_Q" "$IMAGE_ROOT/$dir/$NAME.jpg"
  fi
}

if [ "$ALL" = 1 ]; then
  count=0
  while IFS='|' read -r raw_key _rest; do
    key=$(trim "$raw_key")
    [ -n "$key" ] || continue
    profile_lookup "$key"
    resolve
    generate "$key" "$PROF_DIR" "$IMAGE_ROOT/$PROF_SRC" \
      "$PROF_HCROP" "$PROF_HSIZE" "$PROF_OGSIZE" "$PROF_MCROP"
    count=$((count + 1))
  done < <(printf '%s\n' "$PROFILES")
  [ "$DRY" = 1 ] || echo "done: $count profiles"
  exit 0
fi

[ -n "$PRODUCT" ] || { echo "error: --product <id> is required (or use --all)" >&2; exit 2; }
[ -n "$SRC" ]     || { echo "error: a source image path is required" >&2; exit 2; }

profile_lookup "$PRODUCT"
dir="${PROF_DIR:-$PRODUCT}"

if [ -f "$SRC" ]; then in_path="$SRC"
elif [ -f "$IMAGE_ROOT/$SRC" ]; then in_path="$IMAGE_ROOT/$SRC"
else echo "error: source image not found: $SRC" >&2; exit 1; fi

resolve
HERO_CROP="${OPT_HCROP:-${PROF_HCROP:--}}"
HERO="${OPT_HSIZE:-${PROF_HSIZE:-}}"
OG="${OPT_OG:-${PROF_OGSIZE:-}}"
[ -n "$HERO" ] || [ ! -f "$IMAGE_ROOT/$dir/$NAME.webp" ]   || HERO=$(sizes "$IMAGE_ROOT/$dir/$NAME.webp")
[ -n "$OG" ]   || [ ! -f "$IMAGE_ROOT/$dir/$NAME-og.png" ] || OG=$(sizes "$IMAGE_ROOT/$dir/$NAME-og.png")
[ -n "$HERO" ] || HERO=$(sizes "$in_path")
[ -n "$OG" ]   || OG=1200x675

MASTER_CROP="${OPT_MCROP:-${PROF_MCROP:-}}"
if [ "$MASTER" = 1 ] && { [ -z "$MASTER_CROP" ] || [ "$MASTER_CROP" = "-" ]; }; then MASTER_CROP=cover; fi

generate "$PRODUCT" "$dir" "$in_path" "$HERO_CROP" "$HERO" "$OG" "$MASTER_CROP"
