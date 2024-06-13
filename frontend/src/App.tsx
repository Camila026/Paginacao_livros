import { useEffect, useState } from "react";
import "./App.css";

interface Livro {
    _id: string;
    titulo: string;
    autor: string;
    isbn: string;
    paginas: number;
    ano: number;
    valor: number;
}

const tam_pag = 10;

const PaginacaoButton = ({ onClick, label, disabled, className }: { onClick: () => void; label: string; disabled: boolean; className?: string }) => (
    <button 
    className={`paginacao-button ${className}`} 
    disabled={disabled} 
    onClick={onClick} 
    style={{ cursor: disabled ? "not-allowed" : "pointer", backgroundColor: disabled ? "#242323" : "#030303", border: "1px solid black" }}
    >
        {label}
    </button>
);

const App = () => {
    const [livros, setLivros] = useState<Livro[]>([]);
    const [totalPags, setTotalPags] = useState(0);
    const [totalLivros, setTotalLivros] = useState(0);
    const [currentPag, setCurrentPage] = useState(1);
    
    useEffect(() => {
        fetchData();
    }, [currentPag]);

    const fetchData = async () => {
        try {
            const [livrosData, totalData] = await Promise.all([fetchBooks(currentPag), fetchTotalBooks()]);
            setLivros(livrosData);
            setTotalLivros(totalData.amount);
            setTotalPags(Math.ceil(totalData.amount / tam_pag));
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        }
    };

    const fetchBooks = async (pag: number): Promise<Livro[]> => {
        const response = await fetch(`http://localhost:3001/books/${pag}`);
        if (!response.ok) {
            throw new Error("Falha ao buscar livros");
        }
        return response.json();
    };

    const fetchTotalBooks = async () => {
        const response = await fetch(`http://localhost:3001/len`);
        if (!response.ok) {
            throw new Error("Falha ao buscar livros");
        }
        return response.json();
    };

    const handlePageChange = (pag: number) => {
        setCurrentPage(pag);
    };

    const renderPageNumbers = () => {
        const pagNumbers = [];
        const startPag = Math.max(1, currentPag - 3);
        const endPag = Math.min(totalPags, startPag + 6);

        for (let i = startPag; i <= endPag; i++) {
            pagNumbers.push(
                <PaginacaoButton
                    key={i}
                    onClick={() => handlePageChange(i)}
                    label={i.toString()}
                    disabled={i === currentPag}
                    className={i === currentPag ? "selected" : ""}
                />
            );
        }

        return pagNumbers;
    };

    return (
        <div className="App">
            <h1>Paginacao de Livros</h1>
            <div className="App-table">
                <table>
                    <thead>
                        <tr>
                            <th>Titulo</th>
                            <th>Autor</th>
                            <th>ISBN</th>
                            <th>Paginas</th>
                            <th>Ano</th>
                            <th>Preco</th>
                        </tr>
                    </thead>
                    <tbody>
                        {livros.map((livro: Livro) => (
                            <tr key={livro._id}>
                                <td>{livro.titulo}</td>
                                <td>{livro.autor}</td>
                                <td>{livro.isbn}</td>
                                <td>{livro.paginas}</td>
                                <td>{livro.ano}</td>
                                <td>R${livro.valor}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="App-paginacao-info">
                Exibindo de {((currentPag - 1) * tam_pag) + 1} a {Math.min(currentPag * tam_pag, totalLivros)} livros
            </div>
            <div className="App-paginacao">
                <PaginacaoButton
                    onClick={() => handlePageChange(1)}
                    label="<<"
                    disabled={currentPag <= 1}
                    className={currentPag <= 1 ? "disabled" : ""}
                />
                <PaginacaoButton
                    onClick={() => handlePageChange(currentPag - 1)}
                    label="<"
                    disabled={currentPag <= 1}
                    className={currentPag <= 1 ? "disabled" : ""}
                />
                {renderPageNumbers()}
                <PaginacaoButton
                    onClick={() => handlePageChange(currentPag + 1)}
                    label=">"
                    disabled={currentPag >= totalPags}
                    className={currentPag >= totalPags ? "disabled" : ""}
                />
                <PaginacaoButton
                    onClick={() => handlePageChange(totalPags)}
                    label=">>"
                    disabled={currentPag >= totalPags}
                    className={currentPag >= totalPags ? "disabled" : ""}
                />
            </div>
        </div>
    );
};

export default App;
