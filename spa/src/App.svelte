<script>
	import { EasyrouteProvider, RouterOutlet } from "svelte-easyroute";
	import { router } from "./router.js";
</script>

<EasyrouteProvider {router}>
	<RouterOutlet />
</EasyrouteProvider>
