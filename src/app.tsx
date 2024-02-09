import { ChangeEvent, useState } from "react";
import Logo from "./assets/nlw-logo.svg";
import { NewNoteCard } from "./components/new-note-card";
import { NoteCard } from "./components/note-card";

interface Note {
	id: string,
	date: Date,
	content: string,
}

export function App() {
	const [ searchNotes, setSearchNotes ] = useState("");
	const [ notes, setNotes ] = useState<Note[]>(() => {
		const notesOnStorage = localStorage.getItem("notes");

		if (notesOnStorage) {
			return JSON.parse(notesOnStorage)
		}

		return []
	});

	function onNoteCreated (content: string) {
		const newNote = {
			id: crypto.randomUUID(),
			date: new Date(),
			content
		};

		const notesArray = [newNote, ...notes];

		localStorage.setItem("notes", JSON.stringify(notesArray));

		setNotes(notesArray);
	};

	function handleSearch(event: ChangeEvent<HTMLInputElement>) {
		const query = event.target.value;
		setSearchNotes(query)
	};

	function onNoteDeleted (id: string) {
		const notesArray = notes.filter(note => {
			return note.id !== id;
		});

		setNotes(notesArray);
		localStorage.setItem("notes", JSON.stringify(notesArray));
	};

	const filteredNotes = searchNotes !== "" ? 
		notes.filter(note => note.content.toLocaleLowerCase().includes(searchNotes.toLocaleLowerCase())) : notes;

	return (
	<div className="mx-auto max-w-6xl my-12 space-y-7 px-5">
		<img src={Logo} alt="Logo NLW Expert" />

		{/* SEARCH NOTES */}
		<form className="w-full">
			<input 
				type="text" 
				placeholder="Busque as suas notas"
				onChange={handleSearch}
				className="w-full bg-transparent text-3xl font-semibold tracking-tight placeholder:text-slate-500 outline-none" 
			/>
		</form>

		{/* DIVISOR */}
		<div className="h-px bg-slate-700"/>

		{/* CARDS */}	
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[250px] gap-6 overflow-hidden p-1">
			{/* CARD ADICIONAR NOTA*/}
			<NewNoteCard onNoteCreated={onNoteCreated} />

			{/* NOTAS EXISTENTES */}
			{filteredNotes.map(note => {
				return <NoteCard 
							note = {note}
							key={note.id}
							onNoteDeleted = {onNoteDeleted}
						/>
			})}
			
		</div>
	</div>
	);
}
