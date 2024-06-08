<script lang="ts">
	import '../app.css';

	import NavBar from '../components/navigation/NavBar.svelte';
	import Footer from '../components/navigation/Footer.svelte';
</script>

<NavBar />

<main>
	<slot />
</main>

<Footer />
