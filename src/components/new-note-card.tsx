import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import React, { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

interface NewNoteCardProps {
	onNoteCreated: (content: string) => void
};

let speechRecognition: SpeechRecognition | null;

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
	const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
	const [ noteContent, setNoteContent ] = useState("");
	const [ isRecording, setIsRecording ] = useState(false);

	function handleStartEditor() {
		setShouldShowOnboarding(false);
	};

	function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
		setNoteContent(event.target.value);

		if (event.target.value === "") {
			setShouldShowOnboarding(true);
		}
	};

	function handleSaveNote(event: FormEvent) {
		event.preventDefault();

		if (noteContent === "") {
			return;
		};

		onNoteCreated(noteContent);

		setNoteContent("");
		setShouldShowOnboarding(true);
		
		toast.success("Nota criada com sucesso!")
	};

	function handleStartRecording (event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();

		const isSpeechRecognitionAPIAvailable = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

		if (!isSpeechRecognitionAPIAvailable) {
			alert("Infelizmente seu navegador não suporta essa funcionalidade!");
			return;
		};

		setIsRecording(true);
		setShouldShowOnboarding(false);

		const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

		speechRecognition = new SpeechRecognitionAPI();

		speechRecognition.lang = "pt-BR";
		speechRecognition.continuous = true;
		speechRecognition.maxAlternatives = 1;
		speechRecognition.interimResults = true;

		// TRANSCREVENDO E MOSTRANDO A FALA
		speechRecognition.onresult = (event) => {
			const transcription = Array.from(event.results).reduce((text, result) => {
				return text.concat(result[0].transcript)
			}, "");
			
			setNoteContent(transcription);
		};

		// LIDANDO COM UM POSSÍVEL ERRO
		speechRecognition.onerror = (event) => {
			console.error(event);
		};

		speechRecognition.start();
	};

	function handleStopRecording () {
		setIsRecording(false);

		if (speechRecognition !== null) {
			speechRecognition.stop();
		}
	}

	return (
		<Dialog.Root>
			<Dialog.Trigger className="rounded-md bg-slate-700 p-5 gap-y-3 flex flex-col text-left hover:ring-2 hover:ring-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-lime-400">
				<span className="text-sm font-medium text-slate-200">
					Adicionar nota
				</span>
				<p className="text-sm leading-6 text-slate-400">
					Grave uma nota em áudio que será convertida para texto
					automaticamente.
				</p>
			</Dialog.Trigger>

			{/* CONTEÚDO DO MODAL DE CRIAR NOVA NOTA */}
			<Dialog.Portal>
				<Dialog.Overlay className="inset-0 fixed bg-black/50" />

				{/* CONTEÚDO DA NOTA */}
				<Dialog.Content className="fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none overflow-hidden">
					{/* BOTÃO DE FECHAR MODAL */}
					<Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
						<X className="size-5" />
					</Dialog.Close>

					{/* ADICIONAR NOTA */}
					<form
						className="flex-1 flex flex-col">
						<div className="flex flex-1 flex-col gap-3 p-5">
							<span className="text-sm font-medium text-slate-300">
								Adicionar nota
							</span>

							{/* CONTEÚDO DA NOTA */}
							{shouldShowOnboarding ? (
								<p className="text-sm leading-6 text-slate-400">
									Comece{" "}
									<button className="font-md text-lime-400 hover:underline" onClick={handleStartRecording}>
										gravando uma nota em áudio
									</button>{" "}
									ou se preferir{" "}
									<button
										className="font-md text-lime-400 hover:underline"
										onClick={handleStartEditor}>
										utilize apenas texto
									</button>
									.
								</p>
							) : (
								<textarea
									autoFocus
									className="bg-transparent resize-none text-slate-400 text-sm leading-6 flex-1 outline-none selection:bg-lime-400 selection:text-slate-900"
									onChange={handleContentChange}
									value={noteContent}
								/>
							)}
						</div>

						{isRecording ? (
								<button
									type="button"
									className="w-full bg-slate-900 py-4 text-center text-sm text-lime-300 outline-none font-medium flex items-center justify-center gap-2 hover:text-slate-100"
									onClick={handleStopRecording}	
								>
									<div className="size-3 rounded-full bg-red-500 animate-pulse" />
									Gravando! (Clique para interromper)
								</button>
							) : (
									<button
									type="button"
									className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
									onClick={handleSaveNote}>
									Salvar nota
								</button>
							)
						}
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
