import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '../Icon';
import styles from './styles.module.css';

/**
 * QuickNotes — Notas Rápidas In-App
 * Drawer lateral acessível via botão flutuante OU atalho Ctrl+N.
 * Auto-salva no localStorage. Mantém o usuário no FocusMind.
 *
 * Coloque este componente no AppLayout para disponibilizá-lo em todas as páginas.
 */
export default function QuickNotes() {
    const [open, setOpen] = useState(false);
    const [activeNote, setActiveNote] = useState('');
    const [notes, setNotes] = useState([]);
    const [view, setView] = useState('editor'); // 'editor' | 'list'
    const [saved, setSaved] = useState(false);
    const debounceRef = useRef(null);
    const textareaRef = useRef(null);

    // Carrega notas salvas
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('@FocusMind:quicknotes') || '[]');
        setNotes(stored);
    }, []);

    // Atalho de teclado Ctrl+N
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                setOpen(v => !v);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // Auto-foco no textarea quando abre
    useEffect(() => {
        if (open && view === 'editor') {
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [open, view]);

    // Auto-save com debounce de 600ms
    const autosave = useCallback((text) => {
        clearTimeout(debounceRef.current);
        setSaved(false);
        debounceRef.current = setTimeout(() => {
            if (text.trim()) {
                const stored = JSON.parse(localStorage.getItem('@FocusMind:quicknotes') || '[]');
                // Atualiza a nota "rascunho" (índice 0, se existir e for do dia de hoje)
                const today = new Date().toISOString().split('T')[0];
                if (stored.length > 0 && stored[0].date.startsWith(today) && stored[0].draft) {
                    stored[0].text = text;
                } else {
                    stored.unshift({ text, date: new Date().toISOString(), draft: true });
                }
                localStorage.setItem('@FocusMind:quicknotes', JSON.stringify(stored.slice(0, 50)));
                setNotes(stored);
            }
            setSaved(true);
        }, 600);
    }, []);

    const handleChange = (e) => {
        setActiveNote(e.target.value);
        autosave(e.target.value);
    };

    const saveNote = () => {
        if (!activeNote.trim()) return;
        const stored = JSON.parse(localStorage.getItem('@FocusMind:quicknotes') || '[]');
        // Remove rascunho do dia se existir e substitui pela nota definitiva
        const today = new Date().toISOString().split('T')[0];
        const filtered = stored.filter(n => !(n.draft && n.date.startsWith(today)));
        const newNote = { text: activeNote, date: new Date().toISOString(), draft: false };
        const updated = [newNote, ...filtered].slice(0, 50);
        localStorage.setItem('@FocusMind:quicknotes', JSON.stringify(updated));
        setNotes(updated);
        setActiveNote('');
        setSaved(true);
        setView('list');
    };

    const deleteNote = (idx) => {
        const updated = notes.filter((_, i) => i !== idx);
        localStorage.setItem('@FocusMind:quicknotes', JSON.stringify(updated));
        setNotes(updated);
    };

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* Botão flutuante */}
            <button
                className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
                onClick={() => setOpen(v => !v)}
                title="Notas Rápidas (Ctrl+N)"
                aria-label="Abrir Notas Rápidas"
            >
                <Icon name={open ? 'xmark' : 'pen'} />
            </button>

            {/* Overlay escurecido em mobile */}
            {open && <div className={styles.backdrop} onClick={() => setOpen(false)} />}

            {/* Drawer */}
            <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
                <div className={styles.drawerHeader}>
                    <div className={styles.drawerTitle}>
                        <Icon name="pen" style={{ color: '#7c6cfa' }} />
                        <span>Notas Rápidas</span>
                        <span className={styles.shortcut}>Ctrl+N</span>
                    </div>
                    <div className={styles.headerActions}>
                        <button
                            className={`${styles.tabBtn} ${view === 'editor' ? styles.tabActive : ''}`}
                            onClick={() => setView('editor')}
                        >Nova</button>
                        <button
                            className={`${styles.tabBtn} ${view === 'list' ? styles.tabActive : ''}`}
                            onClick={() => setView('list')}
                        >Salvas ({notes.filter(n => !n.draft).length})</button>
                        <button className={styles.closeBtn} onClick={() => setOpen(false)}>
                            <Icon name="xmark" />
                        </button>
                    </div>
                </div>

                {/* Editor */}
                {view === 'editor' && (
                    <div className={styles.editorSection}>
                        <textarea
                            ref={textareaRef}
                            className={styles.textarea}
                            placeholder="Escreva aqui... (salvo automaticamente)"
                            value={activeNote}
                            onChange={handleChange}
                            rows={8}
                        />
                        <div className={styles.editorFooter}>
                            <span className={styles.autoSaveLabel}>
                                {saved && activeNote ? '✓ Salvo' : activeNote ? 'Salvando...' : ''}
                            </span>
                            <button
                                className={styles.btnSave}
                                onClick={saveNote}
                                disabled={!activeNote.trim()}
                            >
                                <Icon name="check" /> Salvar nota
                            </button>
                        </div>
                        <div className={styles.tipRow}>
                            <Icon name="info" style={{ opacity: 0.4, fontSize: '0.75rem' }} />
                            <span>Pressione <kbd>Ctrl+N</kbd> a qualquer momento para capturar um pensamento.</span>
                        </div>
                    </div>
                )}

                {/* Lista de notas */}
                {view === 'list' && (
                    <div className={styles.notesList}>
                        {notes.filter(n => !n.draft).length === 0 ? (
                            <div className={styles.emptyNotes}>
                                <Icon name="pen" style={{ fontSize: '1.8rem', opacity: 0.2 }} />
                                <p>Nenhuma nota ainda.<br />Escreva algo na aba "Nova"!</p>
                            </div>
                        ) : (
                            notes.filter(n => !n.draft).map((note, idx) => (
                                <div key={idx} className={styles.noteCard}>
                                    <div className={styles.noteText}>
                                        {note.text.length > 120 ? note.text.slice(0, 120) + '...' : note.text}
                                    </div>
                                    <div className={styles.noteMeta}>
                                        <span>{formatDate(note.date)}</span>
                                        <button
                                            className={styles.noteDeleteBtn}
                                            onClick={() => deleteNote(notes.indexOf(note))}
                                        >
                                            <Icon name="trash" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
