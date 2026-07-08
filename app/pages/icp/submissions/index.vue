<script setup lang="ts">
const localePath = useLocalePath()

await navigateTo(localePath('/icp/submissions/me'), { replace: true })
</script>
