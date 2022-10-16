
<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
</script>

<h1>Logg inn med Google</h1>

<form   
	method="POST"
	action="?/enter"
	use:enhance={() => {
		// prevent default callback from resetting the form
		return async ({ result }) => {
			if (result.type === 'success') {
				await invalidateAll();
			}
			await applyAction(result);
		};
	}}
>

</form>