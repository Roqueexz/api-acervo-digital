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

    /**
     * Cadastra um novo empréstimo no banco de dados
     */
    // Recebe um objeto Emprestimo completo e tenta inseri-lo no banco
    static async cadastrarEmprestimo(emprestimo: Emprestimo): Promise<boolean> {
        try {
            // Query SQL de inserção — os "$1" a "$5" serão substituídos pelos valores reais
            // "RETURNING id_emprestimo" faz o banco retornar o ID gerado automaticamente após o INSERT
            const queryInsertEmprestimo = `
                INSERT INTO Emprestimo (id_aluno, id_livro, data_emprestimo, data_devolucao, status_emprestimo)
                VALUES ($1, $2, $3, $4, $5) RETURNING id_emprestimo;
            `;

            // Organiza os valores do objeto emprestimo em um array, na mesma ordem dos placeholders ($1, $2...)
            // Repare que aqui os atributos privados são acessados diretamente (sem getter) — isso funciona dentro da própria classe
            const valores = [emprestimo.id_aluno, emprestimo.id_livro, emprestimo.data_emprestimo, emprestimo.data_devolucao, emprestimo.status_emprestimo];
            // Executa a query passando o array de valores e armazena o resultado
            const resultado = await database.query(queryInsertEmprestimo, valores);

            // Se rowCount for diferente de 0, pelo menos uma linha foi inserida — o cadastro foi bem-sucedido
            if (resultado.rowCount != 0) {
                // Exibe no console o ID do empréstimo recém-criado
                console.log(`Empréstimo cadastrado com sucesso! ID: ${resultado.rows[0].id_emprestimo}`);
                // Retorna true para indicar sucesso
                return true;
            }

            // Se nenhuma linha foi afetada, o cadastro não funcionou — retorna false
            return false;

        } catch (error) {
            // Exibe o erro no console e retorna false em caso de exceção
            console.error(`Erro ao cadastrar empréstimo: ${error}`);
            return false;
        }
    }

    /**
     * Atualiza os dados de um empréstimo existente no banco de dados
     */
    // Diferente dos outros métodos, este recebe os dados separados como parâmetros individuais (não um objeto Emprestimo)
    static async atualizarEmprestimo(
        id_emprestimo: number,    // ID do empréstimo a ser atualizado
        id_aluno: number,         // Novo ID do aluno
        id_livro: number,         // Novo ID do livro
        data_emprestimo: Date,    // Nova data de empréstimo
        data_devolucao: Date,     // Nova data de devolução
        status_emprestimo: string // Novo status do empréstimo
    ): Promise<boolean> {
        try {
            // Query SQL de atualização — o WHERE garante que apenas o empréstimo com o ID correto seja alterado
            // "RETURNING id_emprestimo" retorna o ID do registro atualizado, confirmando que ele existe
            const queryUpdateEmprestimo = `UPDATE Emprestimo
            SET id_aluno = $1, id_livro = $2, data_emprestimo = $3, data_devolucao = $4, status_emprestimo = $5
            WHERE id_emprestimo = $6
            RETURNING id_emprestimo;`;

            // Organiza os valores em um array na mesma ordem dos placeholders da query
            // Repare que id_emprestimo vai por último ($6) pois é usado no WHERE, não no SET
            const valores = [id_aluno, id_livro, data_emprestimo, data_devolucao, status_emprestimo, id_emprestimo];
            // Executa a query de atualização e armazena o resultado
            const resultado = await database.query(queryUpdateEmprestimo, valores);

            // Se rowCount for 0, nenhuma linha foi alterada — significa que o ID não existe no banco
            if (resultado.rowCount === 0) {
                // Lança um erro manualmente para ser capturado pelo bloco catch abaixo
                throw new Error('Empréstimo não encontrado.');
            }

            // Se chegou até aqui, a atualização foi bem-sucedida — retorna true
            return true;

        } catch (error) {
            // Captura tanto erros do banco quanto o erro lançado manualmente acima
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