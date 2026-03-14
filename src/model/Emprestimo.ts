import type EmprestimoDTO from "../dto/EmprestimoDTO.js";
import { DatabaseModel } from "./DatabaseModel.js";

const database = new DatabaseModel().pool;

class Emprestimo {

    private id_emprestimo: number = 0;
    private id_aluno: number;
    private id_livro: number;
    private data_emprestimo: Date;
    private data_devolucao: Date;
    private status_emprestimo: string;
    private status_emprestimo_registro: boolean = true;

    constructor(
        _id_aluno: number,
        _id_livro: number,
        _data_emprestimo: Date,
        _status_emprestimo?: string,
        _data_devolucao?: Date
    ) {
        const dataDevolucaoPadrao = new Date(_data_emprestimo);
        dataDevolucaoPadrao.setDate(dataDevolucaoPadrao.getDate() + 7);

        this.id_aluno = _id_aluno;
        this.id_livro = _id_livro;
        this.data_emprestimo = _data_emprestimo;
        this.status_emprestimo = _status_emprestimo ?? "Em Andamento";
        this.data_devolucao = _data_devolucao ?? dataDevolucaoPadrao;
    }

    public getIdEmprestimo(): number {
        return this.id_emprestimo;
    }
    public setIdEmprestimo(value: number) {
        this.id_emprestimo = value;
    }

    public getIdAluno(): number {
        return this.id_aluno;
    }
    public setIdAluno(value: number) {
        this.id_aluno = value;
    }

    public getIdLivro(): number {
        return this.id_livro;
    }
    public setIdLivro(value: number) {
        this.id_livro = value;
    }

    public getDataEmprestimo(): Date {
        return this.data_emprestimo;
    }
    public setDataEmprestimo(value: Date) {
        this.data_emprestimo = value;
    }

    public getDataDevolucao(): Date {
        return this.data_devolucao;
    }
    public setDataDevolucao(value: Date) {
        this.data_devolucao = value;
    }

    public getStatusEmprestimo(): string {
        return this.status_emprestimo;
    }
    public setStatusEmprestimo(value: string) {
        this.status_emprestimo = value;
    }

    public getStatusEmprestimoRegistro(): boolean {
        return this.status_emprestimo_registro;
    }
    public setStatusEmprestimoRegistro(value: boolean) {
        this.status_emprestimo_registro = value;
    }

     /**
     * Retorna uma lista com todos os Emprestimos cadastrados no banco de dados
     * 
     * @returns Lista com todos os Emprestimos cadastrados no banco de dados
     */
    static async listarEmprestimos(): Promise<Array<EmprestimoDTO> | null> {
        // Criando lista vazia para armazenar os emprestimos
        let listaDeEmprestimos: Array<EmprestimoDTO> = [];

        try {
            // Query para consulta no banco de dados
            const querySelectEmprestimo = `
                SELECT e.id_emprestimo, e.id_aluno, e.id_livro,
                       e.data_emprestimo, e.data_devolucao, e.status_emprestimo, e.status_emprestimo_registro,
                       a.ra, a.nome, a.sobrenome, a.celular, a.email,
                       l.titulo, l.autor, l.editora, l.isbn
                FROM Emprestimo e
                JOIN Aluno a ON e.id_aluno = a.id_aluno
                JOIN Livro l ON e.id_livro = l.id_livro
                WHERE e.status_emprestimo_registro = TRUE;
            `;

            // Executa a query no banco de dados
            const respostaBD = await database.query(querySelectEmprestimo);

            // Verifica se há resultados
            if (respostaBD.rows.length === 0) {
                return null;
            }

            // Itera sobre as linhas retornadas
            respostaBD.rows.forEach((linha: any) => {
                // Monta o objeto de empréstimo com os dados do aluno e do livro
                const emprestimoDTO: EmprestimoDTO = {
                    id_emprestimo: linha.id_emprestimo,
                    data_emprestimo: linha.data_emprestimo,
                    data_devolucao: linha.data_devolucao,
                    status_emprestimo: linha.status_emprestimo,
                    status_emprestimo_registro: linha.status_emprestimo_registro,
                    aluno: {
                        id_aluno: linha.id_aluno,
                        ra: linha.ra,
                        nome: linha.nome,
                        sobrenome: linha.sobrenome,
                        celular: linha.celular,
                        email: linha.email
                    },
                    livro: {
                        id_livro: linha.id_aluno,
                        titulo: linha.titulo,
                        autor: linha.autor,
                        editora: linha.editora,
                        isbn: linha.isbn
                    }
                };

                // Adiciona o objeto à lista de empréstimos
                listaDeEmprestimos.push(emprestimoDTO);
            });

            // retorna a lista de empréstimos
            return listaDeEmprestimos;

            // captura qualquer erro que possa acontecer
        } catch (error) {
            // exibe o erro detalhado no console
            console.log(`Erro ao acessar o modelo: ${error}`);
            // retorna um valor nulo
            return null;
        }
    }
}

export default Emprestimo;