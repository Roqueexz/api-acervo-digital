import type LivroDTO from "../dto/LivroDTO.js";
import { DatabaseModel } from "./DatabaseModel.js";

const database = new DatabaseModel().pool;

class Livro {
    private id_livro: number = 0;
    private titulo: string;
    private autor: string;
    private editora: string;
    private ano_publicacao: string;
    private isbn: string;
    private quant_total: number;
    private quant_disponivel: number;
    private quant_aquisicao: number;
    private valor_aquisicao: number;
    private status_livro_emprestado: string = "Disponível";
    // Corrigido: status_livro começa como true — um livro recém criado deve estar ativo
    private status_livro: boolean = true;

    constructor(
        _titulo: string,
        _autor: string,
        _editora: string,
        _ano_publicacao: string,
        _isbn: string,
        _quant_total: number,
        _quant_disponivel: number,
        _quant_aquisicao: number,
        _valor_aquisicao: number
    ) {
        this.titulo = _titulo;
        this.autor = _autor;
        this.editora = _editora;
        this.ano_publicacao = _ano_publicacao;
        this.isbn = _isbn;
        this.quant_total = _quant_total;
        this.quant_disponivel = _quant_disponivel;
        // Corrigido: _quant_aquisicao era recebido mas nunca atribuído
        this.quant_aquisicao = _quant_aquisicao;
        this.valor_aquisicao = _valor_aquisicao;
    }

    public getIdLivro(): number { return this.id_livro; }
    public setIdLivro(value: number): void { this.id_livro = value; }

    public getTitulo(): string { return this.titulo; }
    public setTitulo(value: string): void { this.titulo = value; }

    public getAutor(): string { return this.autor; }
    public setAutor(value: string): void { this.autor = value; }

    public getEditora(): string { return this.editora; }
    public setEditora(value: string): void { this.editora = value; }

    public getAnoPublicacao(): string { return this.ano_publicacao; }
    public setAnoPublicacao(value: string): void { this.ano_publicacao = value; }

    public getIsbn(): string { return this.isbn; }
    public setIsbn(value: string): void { this.isbn = value; }

    public getQuantTotal(): number { return this.quant_total; }
    public setQuantTotal(value: number): void { this.quant_total = value; }

    public getQuantDisponivel(): number { return this.quant_disponivel; }
    public setQuantDisponivel(value: number): void { this.quant_disponivel = value; }

    public getQuantAquisicao(): number { return this.quant_aquisicao; }
    public setQuantAquisicao(value: number): void { this.quant_aquisicao = value; }

    public getValorAquisicao(): number { return this.valor_aquisicao; }
    public setValorAquisicao(value: number): void { this.valor_aquisicao = value; }

    public getStatusLivroEmprestado(): string { return this.status_livro_emprestado; }
    public setStatusLivroEmprestado(value: string): void { this.status_livro_emprestado = value; }

    public getStatusLivro(): boolean { return this.status_livro; }
    public setStatusLivro(value: boolean): void { this.status_livro = value; }
    // ==================== MÉTODOS ESTÁTICOS (operações no banco de dados) ====================
    // Métodos "static" pertencem à classe, não ao objeto — são chamados como Livro.listarLivros()

   static async listarLivros(): Promise<Array<LivroDTO> | null> {
    try {
        const querySelectLivro = `SELECT * FROM Livro WHERE status_livro = TRUE;`;
        const respostaBD = await database.query(querySelectLivro);

        if (respostaBD.rows.length === 0) return null;

        // map substitui o forEach — mais idiomático para transformar arrays,
        // e elimina a necessidade de declarar a lista vazia fora do try
        const listaDeLivros: Array<LivroDTO> = respostaBD.rows.map((livro: any) => ({
            id_livro: livro.id_livro,
            titulo: livro.titulo,
            autor: livro.autor,
            editora: livro.editora,
            ano_publicacao: livro.ano_publicacao,
            isbn: livro.isbn,
            quant_total: livro.quant_total,
            quant_disponivel: livro.quant_disponivel,
            quant_aquisicao: livro.quant_aquisicao,
            valor_aquisicao: livro.valor_aquisicao,
            status_livro_emprestado: livro.status_livro_emprestado,
            status_livro: livro.status_livro
        }));

        return listaDeLivros;

    } catch (error) {
        console.log(`Erro ao acessar o modelo: ${error}`);
        return null;
    }
}

  static async listarLivro(id_livro: number): Promise<LivroDTO | null> {
    try {
        const querySelectLivro = `SELECT * FROM livro WHERE id_livro = $1`;
        const respostaBD = await database.query(querySelectLivro, [id_livro]);

        // Verifica se o livro foi encontrado antes de acessar rows[0]
        if (respostaBD.rows.length === 0) return null;

        // Destructuring: extrai todas as propriedades de rows[0] em variáveis,
        // evitando repetir respostaBD.rows[0].x em cada linha.
        // "id_livro: id" renomeia pois já existe um parâmetro chamado id_livro no escopo
        const {
            id_livro: id, titulo, autor, editora, ano_publicacao,
            isbn, quant_total, quant_disponivel, quant_aquisicao,
            valor_aquisicao, status_livro_emprestado, status_livro
        } = respostaBD.rows[0];

        const livroDTO: LivroDTO = {
            id_livro: id, titulo, autor, editora, ano_publicacao,
            isbn, quant_total, quant_disponivel, quant_aquisicao,
            valor_aquisicao, status_livro_emprestado, status_livro
        };

        return livroDTO;
    } catch (error) {
        console.error(`Erro ao realizar consulta. ${error}`);
        return null;
    }
}
   static async cadastrarLivro(livro: Livro): Promise<boolean> {
    try {
        const queryInsertLivro = `
            INSERT INTO Livro (titulo, autor, editora, ano_publicacao, isbn, quant_total, quant_disponivel, valor_aquisicao, status_livro_emprestado)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id_livro;
        `;

        // Valores extraídos em array separado — evita lista longa dentro do database.query,
        // tornando o código mais fácil de ler e de adicionar/remover campos no futuro
        const valores = [
            livro.getTitulo().toUpperCase(),
            livro.getAutor().toUpperCase(),
            livro.getEditora().toUpperCase(),
            livro.getAnoPublicacao().toUpperCase(),
            livro.getIsbn().toUpperCase(),
            livro.getQuantTotal(),
            livro.getQuantDisponivel(),
            livro.getValorAquisicao(),
            livro.getStatusLivroEmprestado().toUpperCase()
        ];

        const result = await database.query(queryInsertLivro, valores);

        // Corrigido: substituido rows.length por rowCount — mais consistente com os outros métodos
        if ((result.rowCount ?? 0) > 0) {
            console.log(`Livro cadastrado com sucesso. ID: ${result.rows[0].id_livro}`);
            return true;
        }

        return false;

    } catch (error) {
        console.error(`Erro ao cadastrar livro: ${error}`);
        return false;
    }
}
    /**
     * Remove um livro do banco de dados
     * @param id_livro ID do livro a ser removido
     * @returns Boolean indicando se a remoção foi bem-sucedida
    */
    // Realiza uma remoção lógica: não apaga o registro, apenas muda o status para FALSE
    static async removerLivro(id_livro: number): Promise<boolean> {
        try {
            // Busca o livro no banco antes de tentar remover, para verificar se ele existe e está ativo
            const livro: LivroDTO | null = await this.listarLivro(id_livro);

            // Só prossegue se o livro existir (não for null) E estiver com status ativo (true)
            if (livro && livro.status_livro) {
                // Primeiro desativa todos os empréstimos relacionados a este livro
                // Isso garante a consistência dos dados — um livro removido não pode ter empréstimos ativos
                const queryDeleteEmprestimoLivro = `UPDATE emprestimo
                                    SET status_emprestimo_registro = FALSE 
                                    WHERE id_livro = $1`;

                // Executa a desativação dos empréstimos do livro (não precisa verificar o resultado aqui)
                await database.query(queryDeleteEmprestimoLivro, [id_livro]);

                // Agora desativa o próprio livro (remoção lógica — não apaga, apenas muda o status)
                const queryDeleteLivro = `UPDATE livro
                          SET status_livro = FALSE 
                          WHERE id_livro = $1`;

                // Executa a desativação do livro e armazena o resultado
                const result = await database.query(queryDeleteLivro, [id_livro]);

                // "rowCount" indica quantas linhas foram afetadas pelo UPDATE
                // Retorna true se pelo menos uma linha foi alterada, false caso contrário
                return result.rowCount != 0;
            }

            // Se o livro não existir ou já estiver inativo, retorna false
            return false;
        } catch (error) {
            // Exibe o erro no console e retorna false em caso de falha
            console.log(`Erro na consulta: ${error}`);
            return false;
        }
    }

    /**
     * Atualiza os dados de um livro no banco de dados.
     * @param livro Objeto do tipo Livro com os novos dados
     * @returns true caso sucesso, false caso erro
     */
    // Recebe um objeto Livro com os dados atualizados e os salva no banco
    static async atualizarLivro(livro: Livro): Promise<boolean> {
        try {
            // Antes de atualizar, verifica se o livro existe e está ativo no banco
            const livroConsulta: LivroDTO | null = await this.listarLivro(livro.id_livro);

            // Só prossegue com a atualização se o livro existir e estiver ativo
            if (livroConsulta && livroConsulta.status_livro) {
                // Query SQL de atualização com 10 placeholders ($1 a $10)
                // O $10 no WHERE garante que apenas o livro com o ID correto seja atualizado
                const queryAtualizarLivro = `UPDATE Livro SET 
                                titulo = $1, 
                                autor = $2,
                                editora = $3, 
                                ano_publicacao = $4,
                                isbn = $5, 
                                quant_total = $6,
                                quant_disponivel = $7,
                                valor_aquisicao = $8,
                                status_livro_emprestado = $9
                             WHERE id_livro = $10`;

                // Organiza os novos valores em um array na mesma ordem dos placeholders
                const valores = [
                    livro.getTitulo().toUpperCase(),               // $1 — Título em maiúsculas
                    livro.getAutor().toUpperCase(),                // $2 — Autor em maiúsculas
                    livro.getEditora().toUpperCase(),              // $3 — Editora em maiúsculas
                    livro.getAnoPublicacao().toUpperCase(),        // $4 — Ano de publicação em maiúsculas
                    livro.getIsbn().toUpperCase(),                 // $5 — ISBN em maiúsculas
                    livro.getQuantTotal(),                         // $6 — Quantidade total (número)
                    livro.getQuantDisponivel(),                    // $7 — Quantidade disponível (número)
                    livro.getValorAquisicao(),                     // $8 — Valor de aquisição (número)
                    livro.getStatusLivroEmprestado().toUpperCase(), // $9 — Status em maiúsculas
                    livro.getIdLivro()                             // $10 — ID do livro (usado no WHERE)
                ];

                // Executa a query de atualização e armazena o resultado
                const respostaBD = await database.query(queryAtualizarLivro, valores);

                // Se rowCount for diferente de 0, a atualização funcionou — retorna true
                if (respostaBD.rowCount != 0) {
                    return true;
                }
            }

            // Se o livro não existe, está inativo, ou o UPDATE não afetou nenhuma linha, retorna false
            return false;

        } catch (error) {
            // Exibe o erro no console e retorna false em caso de exceção
            console.log(`Erro na consulta: ${error}`);
            return false;
        }
    }

}

// Exporta a classe Livro para que possa ser importada e usada em outros arquivos do projeto
export default Livro;