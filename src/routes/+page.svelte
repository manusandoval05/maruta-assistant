<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->
<script lang="ts">
	import { onMount } from "svelte";
	import { convertMarkdownToHtml } from "$lib";

	interface Person {
		id: number;
		avatar: number;
		name: string;
	}
	interface MessageFeed {
		id: number;
		host: boolean;
		avatar: number;
		name: string;
		timestamp: string;
		message: string;
		color: string;
	}

	let elemChat: HTMLElement;
	const lorem = "Hola, soy Maruta. Estoy aquí para contestar cualquier pregunta respecto al plan de Nuevo León hacia un futuro con una economía digital con más talento.";


	// Messages
	let messageFeed: MessageFeed[] = [
		{
			id: 0,
			host: false,
			avatar: 48,
			name: 'Maruta',
			timestamp: `Hoy @ ${getCurrentTimestamp()}`,
			message: lorem,
			color: 'variant-soft-primary'
		},
	];
	let currentMessage = '';

	// For some reason, eslint thinks ScrollBehavior is undefined...
	// eslint-disable-next-line no-undef
	function scrollChatBottom(behavior?: ScrollBehavior): void {
		elemChat.scrollTo({ top: elemChat.scrollHeight, behavior });
	}

	function getCurrentTimestamp(): string {
		return new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
	}

	async function addMessage() {

		if(currentMessage === '') return; 

		const newMessage = {
			id: messageFeed.length,
			host: true,
			avatar: 48,
			name: 'User',
			timestamp: `Hoy @ ${getCurrentTimestamp()}`,
			message: currentMessage,
			color: 'variant-soft-primary'
		};
		// Clear prompt
		currentMessage = '';
		// Update the message feed
		messageFeed = [...messageFeed, newMessage];

		const response = await fetch("api/post-message", {
			method: 'POST',
			body: JSON.stringify({
				messageFeed: messageFeed
			}),
			headers: {
				'content-type': "application/json",
			}
		})
		let assistantMessage = "";

		// Add message bubble for assistant
		const emptyMessageBubble = {
			id: messageFeed.length,
			host: false,
			avatar: 48,
			name: 'Maruta',
			timestamp: `Hoy @ ${getCurrentTimestamp()}`,
			message: assistantMessage,
			color: 'variant-soft-primary'
		};

		messageFeed = [ ...messageFeed, emptyMessageBubble ];


		for await (const chunk of response.body) {
			try{
				const chunkText = new TextDecoder().decode(chunk);

				console.log(chunkText);
				const chunkJson = JSON.parse(chunkText);
				if(chunkJson.event === "thread.message.delta") {
					chunkJson.data.delta.content.forEach(element => {
						
						assistantMessage += element.text.value;

						const curatedMessage = convertMarkdownToHtml(assistantMessage);

						const assistantMessageBubble = {
							id: messageFeed.length,
							host: false,
							avatar: 48,
							name: 'Maruta',
							timestamp: `Hoy @ ${getCurrentTimestamp()}`,
							message: curatedMessage,
							color: 'variant-soft-primary'
						};
						messageFeed.pop();
						messageFeed = [...messageFeed, assistantMessageBubble];
						setTimeout(() => {
							scrollChatBottom('smooth');
						}, 0);

					})
				}
				else if(chunkJson.event === "thread.message.completed"){
					chunkJson.data.content.forEach(element => {
						const completedMessage = element.text.value;
						const curatedMessage = convertMarkdownToHtml(completedMessage);

						const assistantMessageBubble = {
							id: messageFeed.length,
							host: false,
							avatar: 48,
							name: 'Maruta',
							timestamp: `Hoy @ ${getCurrentTimestamp()}`,
							message: curatedMessage,
							color: 'variant-soft-primary'
						};
						messageFeed.pop();
						messageFeed = [...messageFeed, assistantMessageBubble];

						setTimeout(() => {
							scrollChatBottom('smooth');
						}, 0);
					});
				}
			}
			catch(error) {
				console.log(error);
			}
			
		}
		
		// Smooth scroll to bottom
		// Timeout prevents race condition
		setTimeout(() => {
			scrollChatBottom('smooth');
		}, 0);
	}

	function onPromptKeydown(event: KeyboardEvent): void {
		if (['Enter'].includes(event.code)) {
			event.preventDefault();
			addMessage();
		}
	}

	// When DOM mounted, scroll to bottom
	onMount(() => {
		scrollChatBottom();
	});
</script>

<div class="h-full">
	
	<div class="grid md:grid-cols-2 grid-cols-1 gap-3 h-full items-center">
		<div class="space-y-10 flex flex-col items-center ml-5">
			<h2 class="h2">¡Bienvenidos al Mapa de Ruta de Talento y Economía Digital de Nuevo León!</h2>
			<p>En un mundo cada vez más digitalizado y competitivo, Nuevo León se destaca como un líder en innovación y competitividad en México.</p>
			<p>Este Mapa de Ruta tiene identificados los desafíos, oportunidades y acciones prioritarias para acelerar la transición de Nuevo León hacia una economía basada en el conocimiento y la innovación digital.</p>
			<h3 class="h3">Objetivos estratégicos para Nuevo León</h3>
			<div class="text-left">
				<ol class="list">
					<li>
						<span class="badge-icon p-4 variant-soft-primary">1.</span>
						<span class="flex-auto">Atracción de inversiones en sectores de vanguardia.</span>
					</li>
					<li>
						<span class="badge-icon p-4 variant-soft-primary">2.</span>
						<span class="flex-auto">Transformación del sistema educativo para formar los talentos del futuro.</span>
					</li>
					<li>
						<span class="badge-icon p-4 variant-soft-primary">3.</span>
						<span class="flex-auto">Fomento de la innovación y el emprendimiento.</span>
					</li>
					<li>
						<span class="badge-icon p-4 variant-soft-primary">4.</span>
						<span class="flex-auto">Desarrollo de infraestructuras tecnológicas avanzadas.</span>
					</li>
					<li>
						<span class="badge-icon p-4 variant-soft-primary">5.</span>
						<span class="flex-auto">Promoción de una cultura digital inclusiva y sostenible.</span>
					</li>
				</ol>
			</div>
			<div class="flex justify-center space-x-2">
				<a
					class="btn variant-filled"
					href="https://skeleton.dev/"
					target="_blank"
					rel="noreferrer"
				>
					Descargar Mapa
				</a>
			</div>
		</div>
		<div class="space-y-10 text-center flex flex-col items-center">
			<section class="card">
				<div class="chat w-full h-full grid grid-cols-1">
					<!-- Chat -->
					<div class="grid grid-row-[1fr_auto]">
						<!-- Conversation -->
						<section bind:this={elemChat} class="max-h-[500px] p-4 overflow-y-auto space-y-4">
							{#each messageFeed as bubble}
								{#if bubble.host === false}
									<div class="grid grid-cols-[auto_1fr] gap-2">
										<div class="card p-4 variant-soft rounded-tl-none space-y-2">
											<header class="flex justify-between items-center">
												<p class="font-bold mr-1">{bubble.name}</p>
												<small class="opacity-50">{bubble.timestamp}</small>
											</header>
											<div class="text-left">
												{@html bubble.message}
											</div>
										</div>
									</div>
								{:else}
									<div class="grid grid-cols-[1fr_auto] gap-2">
										<div class="card p-4 rounded-tr-none space-y-2 {bubble.color}">
											<header class="flex justify-end items-center">
												<small class="opacity-50">{bubble.timestamp}</small>
											</header>
											<p class="text-left">{bubble.message}</p>
										</div>
									</div>
								{/if}
							{/each}
						</section>
						<!-- Prompt -->
						<section class="border-t border-surface-500/30 p-4 w-full">
							<div class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-container-token">
								<button class="input-group-shim">+</button>
								<textarea
									bind:value={currentMessage}
									class="bg-transparent border-0 ring-0"
									name="prompt"
									id="prompt"
									placeholder="Pregunta..."
									rows="1"
									on:keydown={onPromptKeydown}
								></textarea>
								<button class={currentMessage ? 'variant-filled-primary' : 'input-group-shim'} on:click={addMessage}>
									<i class="fa-solid fa-paper-plane"></i>
								</button>
							</div>
						</section>
					</div>
				</div>
			</section>
		</div>
	</div>
</div>