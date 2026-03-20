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
        // Cria cópia da data para não modificar o objeto original ao calcular o prazo padrão
        const dataDevolucaoPadrao = new Date(_data_emprestimo);
        dataDevolucaoPadrao.setDate(dataDevolucaoPadrao.getDate() + 7);

        this.id_aluno = _id_aluno;
        this.id_livro = _id_livro;
        this.data_emprestimo = _data_emprestimo;
        this.status_emprestimo = _status_emprestimo ?? "Em Andamento";
        this.data_devolucao = _data_devolucao ?? dataDevolucaoPadrao;
    }

    public getIdEmprestimo(): number { return this.id_emprestimo; }
    public setIdEmprestimo(value: number): void { this.id_emprestimo = value; }

    public getIdAluno(): number { return this.id_aluno; }
    public setIdAluno(value: number): void { this.id_aluno = value; }

    public getIdLivro(): number { return this.id_livro; }
    public setIdLivro(value: number): void { this.id_livro = value; }

    public getDataEmprestimo(): Date { return this.data_emprestimo; }
    public setDataEmprestimo(value: Date): void { this.data_emprestimo = value; }

    public getDataDevolucao(): Date { return this.data_devolucao; }
    public setDataDevolucao(value: Date): void { this.data_devolucao = value; }

    public getStatusEmprestimo(): string { return this.status_emprestimo; }
    public setStatusEmprestimo(value: string): void { this.status_emprestimo = value; }

    public getStatusEmprestimoRegistro(): boolean { return this.status_emprestimo_registro; }
    public setStatusEmprestimoRegistro(value: boolean): void { this.status_emprestimo_registro = value; }

    // ==================== MÉTODOS ESTÁTICOS (operações no banco de dados) ====================
    // Métodos "static" pertencem à classe, não ao objeto — são chamados como Emprestimo.listarEmprestimos()

    /**
    * Retorna uma lista com todos os Emprestimos cadastrados no banco de dados
    * 
    * @returns Lista com todos os Emprestimos cadastrados no banco de dados
    */
    // Método assíncrono que busca todos os empréstimos ativos e retorna uma lista de EmprestimoDTO ou null
   static async listarEmprestimos(): Promise<Array<EmprestimoDTO> | null> {
    try {
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

        const respostaBD = await database.query(querySelectEmprestimo);

        if (respostaBD.rows.length === 0) return null;

        // map substitui o forEach — mais idiomático para transformar arrays,
        // e elimina a necessidade de declarar a lista vazia fora do try
        const listaDeEmprestimos: Array<EmprestimoDTO> = respostaBD.rows.map((linha: any) => ({
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
                id_livro: linha.id_livro,
                titulo: linha.titulo,
                autor: linha.autor,
                editora: linha.editora,
                isbn: linha.isbn
            }
        }));

        return listaDeEmprestimos;

    } catch (error) {
        console.log(`Erro ao acessar o modelo: ${error}`);
        return null;
    }
}
 static async listarEmprestimo(id_emprestimo: number): Promise<EmprestimoDTO | null> {
    try {
        const querySelectEmprestimo = `
            SELECT e.id_emprestimo, e.id_aluno, e.id_livro,
                   e.data_emprestimo, e.data_devolucao, e.status_emprestimo, e.status_emprestimo_registro,
                   a.ra, a.nome, a.sobrenome, a.celular, a.email,
                   l.titulo, l.autor, l.editora, l.isbn
            FROM Emprestimo e
            JOIN Aluno a ON e.id_aluno = a.id_aluno
            JOIN Livro l ON e.id_livro = l.id_livro
            WHERE e.id_emprestimo = $1;
        `;

        const respostaBD = await database.query(querySelectEmprestimo, [id_emprestimo]);

        // Verifica se o empréstimo foi encontrado antes de acessar rows[0]
        if (respostaBD.rows.length === 0) return null;

        // Destructuring: extrai todas as propriedades de rows[0] em variáveis,
        // evitando repetir respostaBD.rows[0].x em cada linha
        const {
            id_emprestimo: id, id_aluno, id_livro,
            data_emprestimo, data_devolucao, status_emprestimo, status_emprestimo_registro,
            ra, nome, sobrenome, celular, email,
            titulo, autor, editora, isbn
        } = respostaBD.rows[0];

        const emprestimoDTO: EmprestimoDTO = {
            id_emprestimo: id,
            data_emprestimo,
            data_devolucao,
            status_emprestimo,
            status_emprestimo_registro,
            aluno: { id_aluno, ra, nome, sobrenome, celular, email },
            livro: { id_livro, titulo, autor, editora, isbn }
        };

        return emprestimoDTO;
    } catch (error) {
        console.error(`Erro ao realizar consulta: ${error}`);
        return null;
    }
}

   static async cadastrarEmprestimo(emprestimo: Emprestimo): Promise<boolean> {
    try {
        const queryInsertEmprestimo = `
            INSERT INTO Emprestimo (id_aluno, id_livro, data_emprestimo, data_devolucao, status_emprestimo)
            VALUES ($1, $2, $3, $4, $5) RETURNING id_emprestimo;
        `;

        // Corrigido: atributos privados acessados via getters em vez de acesso direto
        const valores = [
            emprestimo.getIdAluno(),
            emprestimo.getIdLivro(),
            emprestimo.getDataEmprestimo(),
            emprestimo.getDataDevolucao(),
            emprestimo.getStatusEmprestimo()
        ];

        const resultado = await database.query(queryInsertEmprestimo, valores);

        // Corrigido: igualdade estrita e ?? 0 para evitar comparação com null
        if ((resultado.rowCount ?? 0) > 0) {
            console.log(`Empréstimo cadastrado com sucesso! ID: ${resultado.rows[0].id_emprestimo}`);
            return true;
        }

        return false;

    } catch (error) {
        console.error(`Erro ao cadastrar empréstimo: ${error}`);
        return false;
    }
}
  static async atualizarEmprestimo(
    id_emprestimo: number,
    id_aluno: number,
    id_livro: number,
    data_emprestimo: Date,
    data_devolucao: Date,
    status_emprestimo: string
): Promise<boolean> {
    try {
        const queryUpdateEmprestimo = `
            UPDATE Emprestimo
            SET id_aluno = $1, id_livro = $2, data_emprestimo = $3, data_devolucao = $4, status_emprestimo = $5
            WHERE id_emprestimo = $6
            RETURNING id_emprestimo;
        `;

        const valores = [id_aluno, id_livro, data_emprestimo, data_devolucao, status_emprestimo, id_emprestimo];
        const resultado = await database.query(queryUpdateEmprestimo, valores);

        // Corrigido: throw new Error dentro do try era capturado pelo proprio catch,
        // tornando o fluxo confuso — retorno direto de false é mais claro e direto
        if ((resultado.rowCount ?? 0) === 0) return false;

        return true;

    } catch (error) {
        console.error(`Erro ao atualizar empréstimo: ${error}`);
        return false;
    }
}
    /**
     * Remove um empréstimo ativo do banco de dados
     * 
     * @param id_emprestimo 
     * @returns true caso o empréstimo tenha sido removido, false caso contrário
     */
    // Realiza uma remoção lógica: não apaga o registro, apenas muda o status para FALSE
    static async removerEmprestimo(id_emprestimo: number): Promise<boolean> {
        try {
            // Query de remoção lógica — usa UPDATE para desativar o registro em vez de DELETE
            // Isso preserva o histórico de empréstimos no banco de dados
            const queryDeleteEmprestimo = `UPDATE emprestimo 
                                            SET status_emprestimo_registro = FALSE
                                            WHERE id_emprestimo=$1`;

            // Executa a query passando o ID do empréstimo como parâmetro (substitui o $1)
            const respostaBD = await database.query(queryDeleteEmprestimo, [id_emprestimo]);

            // Verifica se pelo menos uma linha foi afetada pelo UPDATE
            if (respostaBD.rowCount != 0) {
                // Exibe mensagem de sucesso no console
                console.log('Empréstimo removido com sucesso!');
                // Retorna true para indicar que a remoção foi bem-sucedida
                return true;
            }

            // Se rowCount for 0, nenhum registro foi encontrado com esse ID — retorna false
            return false;

        } catch (error) {
            // Exibe o erro no console e retorna false em caso de falha
            console.log(`Erro ao remover empréstimo: ${error}`);
            return false;
        }
    }
}

// Exporta a classe Emprestimo para que possa ser importada e usada em outros arquivos do projeto
export default Emprestimo;