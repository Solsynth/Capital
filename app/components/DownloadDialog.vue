<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { Check, Copy, X } from "@lucide/vue";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import { artifactPlatformLabel, formatArtifactSize, shipmentNumber } from "~/utils/download";

const { t, locale } = useI18n();
const { open, receipt } = useDownloadReceipt();

const copied = ref(false);
// The dialog is opened from many buttons, so remember which one to hand focus back to.
let returnFocusTo: HTMLElement | null = null;

watch(open, (isOpen, wasOpen) => {
  if (isOpen) {
    returnFocusTo = document.activeElement as HTMLElement | null;
    return;
  }
  if (wasOpen && returnFocusTo) {
    const element = returnFocusTo;
    returnFocusTo = null;
    nextTick(() => element.focus?.());
  }
}, { flush: "sync" });

const artifact = computed(() => receipt.value?.artifact ?? null);
const subtitle = computed(() => {
  const subject = receipt.value?.productTitle || (receipt.value?.version ? `v${receipt.value.version}` : null);
  return subject ? t("downloadDialog.subtitle", { subject }) : t("downloadDialog.subtitleGeneric");
});
const destination = computed(() => {
  const parts = [artifactPlatformLabel(artifact.value?.platform), artifact.value?.architecture].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
});
const sizeLabel = computed(() => formatArtifactSize(artifact.value?.size));
const sealNumber = computed(() => shipmentNumber(artifact.value?.hash));
const dispatchedAt = computed(() => {
  const time = receipt.value?.at ? Date.parse(receipt.value.at) : Number.NaN;
  return Number.isNaN(time)
    ? null
    : new Intl.DateTimeFormat(locale.value, { hour: "2-digit", minute: "2-digit", hour12: false }).format(time);
});

const fields = computed<Array<{ label: string; value: string; wide?: boolean }>>(() => [
  { label: t("downloadDialog.waybill.destination"), value: destination.value || t("releasePage.unknownPlatform") },
  { label: t("downloadDialog.waybill.weight"), value: sizeLabel.value || "—" },
  { label: t("downloadDialog.waybill.item"), value: artifact.value?.file_name || t("releasePage.unnamedFile"), wide: true },
]);

async function copyChecksum() {
  const hash = artifact.value?.hash;
  if (!hash) return;
  try {
    await navigator.clipboard.writeText(hash);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // clipboard may be unavailable
  }
}

/** Keep a click in the toast stack from dismissing the ticket underneath it. */
function keepToastsClickable(event: any) {
  const target = event.detail.originalEvent.target as HTMLElement;
  if (target?.closest("[data-toast-viewport]")) event.preventDefault();
}
</script>

<template>
  <DialogRoot :open="open" @update:open="open = $event">
    <DialogPortal>
      <DialogOverlay class="scrim" />
      <DialogContent
        class="sheet"
        @pointer-down-outside="keepToastsClickable"
      >
        <div class="sheet-head">
          <div class="min-w-0">
            <ExpressMark />
            <DialogTitle class="sheet-title">{{ t("downloadDialog.title") }}</DialogTitle>
            <DialogDescription class="sheet-subtitle">{{ subtitle }}</DialogDescription>
          </div>
          <DialogClose class="btn btn-ghost btn-square btn-sm close" :aria-label="t('downloadDialog.close')">
            <X class="h-4 w-4" aria-hidden="true" />
          </DialogClose>
        </div>

        <dl v-if="artifact" class="fields">
          <div v-for="field in fields" :key="field.label" :class="field.wide ? 'field wide' : 'field'">
            <dt class="field-label">{{ field.label }}</dt>
            <dd class="field-value">{{ field.value }}</dd>
          </div>
        </dl>

        <div v-if="artifact?.hash" class="block">
          <div class="block-head">
            <p class="field-label">{{ t("downloadDialog.waybill.seal") }}</p>
            <button
              type="button"
              class="btn btn-ghost btn-xs btn-square shrink-0"
              :aria-label="copied ? t('downloadDialog.copied') : t('downloadDialog.copyChecksum')"
              @click="copyChecksum"
            >
              <Check v-if="copied" class="h-3.5 w-3.5 text-success" aria-hidden="true" />
              <Copy v-else class="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <code class="mono seal">{{ artifact.hash }}</code>
          <p class="hint">{{ t("downloadDialog.verifyHint") }}</p>
        </div>

        <div v-if="sealNumber" class="block">
          <div class="barcode">
            <ExpressBarcode :value="sealNumber" />
          </div>
          <div class="barcode-meta">
            <p class="mono">{{ sealNumber }}</p>
            <div v-if="dispatchedAt" class="barcode-time">
              <span class="field-label">{{ t("downloadDialog.waybill.dispatched") }}</span>
              <span class="mono">{{ dispatchedAt }}</span>
            </div>
          </div>
        </div>

        <div class="sheet-foot">
          <p v-if="receipt?.url" class="min-w-0 text-sm">
            <span class="foot-note">{{ t("downloadDialog.didNotStart") }}</span>
            <a :href="receipt.url" rel="noopener noreferrer" class="link-quiet ml-1">
              {{ t("downloadDialog.downloadAgain") }}
            </a>
          </p>
          <button type="button" class="btn btn-primary btn-sm shrink-0" @click="open = false">
            {{ t("downloadDialog.close") }}
          </button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: color-mix(in oklab, #141316 68%, transparent);
  backdrop-filter: blur(3px);
}

.sheet {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 50;
  width: calc(100% - 2rem);
  max-width: 27rem;
  max-height: calc(100dvh - 3rem);
  overflow-y: auto;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sheet);
  background: var(--color-base-200);
  transform: translate(-50%, -50%);
  outline: none;
}

.sheet-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1.25rem 1.375rem 1rem;
}

.sheet-title {
  margin: 0.6rem 0 0;
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.015em;
}

.sheet-subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--color-faint);
}

.close {
  margin-top: -0.15rem;
  margin-right: -0.35rem;
  flex-shrink: 0;
}

.fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem 1rem;
  margin: 0;
  padding: 0.9rem 1.375rem 1rem;
  border-top: 1px solid var(--color-line-soft);
}

.field {
  min-width: 0;
}

.field.wide {
  grid-column: span 2;
}

.field-label {
  margin: 0;
}

.field-value {
  margin: 0.15rem 0 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.45;
  color: var(--color-base-content);
  overflow-wrap: anywhere;
}

.block {
  padding: 0.9rem 1.375rem 1rem;
  border-top: 1px solid var(--color-line-soft);
}

.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.seal {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.6875rem;
  line-height: 1.5;
  color: var(--color-dim);
  overflow-wrap: anywhere;
}

.hint {
  margin: 0.35rem 0 0;
  font-size: 0.6875rem;
  color: var(--color-faint);
}

.barcode {
  height: 3rem;
}

.barcode-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.4rem 0.75rem;
  margin-top: 0.4rem;
}

.barcode-time {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.barcode-time .field-label {
  margin: 0;
}

.sheet-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1.375rem 1.1rem;
  border-top: 1px solid var(--color-line-soft);
}

.foot-note {
  color: var(--color-faint);
}
</style>
