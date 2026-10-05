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
      <DialogOverlay class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
      <DialogContent
        class="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0 shadow-none focus:outline-none"
        @pointer-down-outside="keepToastsClickable"
      >
        <!-- The modal is the waybill: bands of the ticket, torn above the action stub. -->
        <div class="rounded-2xl shadow-2xl">
          <div class="ticket-sheet rounded-t-2xl border-x border-t border-base-content/10 bg-base-100">
            <div class="flex items-start justify-between gap-3 px-5 pt-4 pb-4">
              <div class="min-w-0">
                <ExpressMark />
                <DialogTitle class="mt-2.5 text-lg font-bold">{{ t("downloadDialog.title") }}</DialogTitle>
                <DialogDescription class="mt-0.5 text-sm opacity-60">{{ subtitle }}</DialogDescription>
              </div>
              <DialogClose class="btn btn-ghost btn-square btn-sm -mt-0.5 -mr-1 shrink-0" :aria-label="t('downloadDialog.close')">
                <X class="h-4 w-4" aria-hidden="true" />
              </DialogClose>
            </div>

            <dl
              v-if="artifact"
              class="grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-dashed border-base-content/15 px-5 py-3.5"
            >
              <div v-for="field in fields" :key="field.label" :class="field.wide ? 'col-span-2' : ''">
                <dt class="waybill-label">{{ field.label }}</dt>
                <dd class="waybill-value mt-1 break-all">{{ field.value }}</dd>
              </div>
            </dl>

            <div v-if="artifact?.hash" class="border-t border-dashed border-base-content/15 px-5 py-3.5">
              <div class="flex items-center justify-between gap-3">
                <p class="waybill-label">{{ t("downloadDialog.waybill.seal") }}</p>
                <button
                  type="button"
                  class="btn btn-ghost btn-xs btn-square shrink-0"
                  :aria-label="copied ? t('downloadDialog.copied') : t('downloadDialog.copyChecksum')"
                  @click="copyChecksum"
                >
                  <Check v-if="copied" class="w-3.5 h-3.5 text-success" aria-hidden="true" />
                  <Copy v-else class="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
              <code class="mt-1.5 block font-mono text-[11px] break-all">{{ artifact.hash }}</code>
              <p class="mt-1.5 text-[11px] opacity-55">{{ t("downloadDialog.verifyHint") }}</p>
            </div>

            <div v-if="sealNumber" class="border-t border-dashed border-base-content/15 px-5 pt-3 pb-2.5">
              <div class="h-12 text-base-content">
                <ExpressBarcode :value="sealNumber" />
              </div>
              <div class="mt-1.5 flex items-baseline justify-between gap-3">
                <p class="font-mono text-[10px] uppercase tracking-[0.16em] opacity-55">{{ sealNumber }}</p>
                <div v-if="dispatchedAt" class="flex items-baseline gap-1.5">
                  <span class="waybill-label">{{ t("downloadDialog.waybill.dispatched") }}</span>
                  <span class="font-mono text-[11px] tabular-nums opacity-70">{{ dispatchedAt }}</span>
                </div>
              </div>
            </div>

            <!-- Tear line, notched out of the ticket edges by the sheet/stub masks. -->
            <div class="border-t border-dashed border-base-content/20" aria-hidden="true" />
          </div>

          <div class="ticket-stub rounded-b-2xl border-x border-b border-base-content/10 bg-base-100">
            <div class="flex items-center justify-between gap-3 px-5 py-3.5">
              <p v-if="receipt?.url" class="min-w-0 text-sm">
                <span class="opacity-60">{{ t("downloadDialog.didNotStart") }}</span>
                <a :href="receipt.url" rel="noopener noreferrer" class="link link-primary ml-1">
                  {{ t("downloadDialog.downloadAgain") }}
                </a>
              </p>
              <button type="button" class="btn btn-primary btn-sm shrink-0" @click="open = false">
                {{ t("downloadDialog.close") }}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
/*
 * Ticket edges: a quarter-disc cut out of each facing corner, so the paired halves read as
 * one half-round notch punched on the tear line. Browsers without mask-composite simply
 * keep square corners.
 */
.ticket-sheet,
.ticket-stub {
  --notch: 9px;
  mask-composite: intersect;
}

.ticket-sheet {
  mask-image:
    radial-gradient(circle var(--notch) at left bottom, transparent 98%, #000 100%),
    radial-gradient(circle var(--notch) at right bottom, transparent 98%, #000 100%);
}

.ticket-stub {
  mask-image:
    radial-gradient(circle var(--notch) at left top, transparent 98%, #000 100%),
    radial-gradient(circle var(--notch) at right top, transparent 98%, #000 100%);
}

.waybill-label {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  opacity: 0.5;
}

.waybill-value {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.4;
}
</style>
