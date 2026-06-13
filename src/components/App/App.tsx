import css from "./App.module.css";
import { useState } from "react";
import {
  useQuery,
  keepPreviousData,
} from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { fetchNotes } from "../../services/noteService";

import SearchBox from "../SearchBox/SearchBox";
import Pagination from "../Pagination/Pagination";
import NoteList from "../NoteList/NoteList";
import NoteForm from "../NoteForm/NoteForm";
import Modal from "../Modal/Modal";

export default function App() {

  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const perPage = 12;

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, 500);

  const { data, isLoading, isFetching, isSuccess } = useQuery({
    queryKey: ["notes", searchQuery, currentPage],
    queryFn: () =>
      fetchNotes({ search: searchQuery, page: currentPage, perPage }),
    placeholderData: keepPreviousData,
  });

  

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox
          textInput={searchInput}
          onSearch={(value) => {
            setSearchInput(value);
            debouncedSearch(value);
          }}
        />
        {isSuccess && data.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={data.totalPages}
            onPageChange={setCurrentPage}
          />
        )}
        <button
          className={css.button}
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading || isFetching}
        >
          Create note +
        </button>
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)}>
            <NoteForm
              onSuccess={() => setIsModalOpen(false)}
              onClose={() => setIsModalOpen(false)}
            />
          </Modal>
        )}
      </header>
      <main className={css.main}>
        {isSuccess && data?.notes?.length > 0 && (
          <NoteList notes={data.notes} />
        )}
      </main>
    </div>
  );
}
