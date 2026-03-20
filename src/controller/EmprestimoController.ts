// Importa a classe Emprestimo do model — é daqui que vêm os métodos de acesso ao banco de dados
import Emprestimo from "../model/Emprestimo.js";
// Importa os tipos Request e Response do Express — representam a requisição e a resposta HTTP
import { type Request, type Response } from "express";
// Importa o tipo EmprestimoDTO para tipar os dados recebidos do front-end
import type EmprestimoDTO from "../dto/EmprestimoDTO.js";

// Define a classe EmprestimoController que HERDA da classe Emprestimo
// A herança permite acessar os métodos estáticos do model diretamente
// O controller é responsável por receber as requisições HTTP e devolver as respostas — nunca acessa o banco diretamente
class EmprestimoController extends Emprestimo {

    /**
    * Método para listar todos os empréstimos.
    * Retorna um array de empréstimos com informações dos alunos e dos livros.
    */
    // Método estático e assíncrono que busca todos os empréstimos ativos e os retorna em JSON
    // "Promise<Response>" indica que este método sempre retorna uma resposta HTTP ao final
    static async todos(req: Request, res: Response): Promise<Response> {
        try {
            // Chama o método do model para buscar todos os empréstimos ativos no banco
            // O resultado já vem com os dados de aluno e livro embutidos (graças ao JOIN da query)
            const listaDeEmprestimos = await Emprestimo.listarEmprestimos();

            // Retorna a lista em formato JSON com status HTTP 200 (OK — requisição bem-sucedida)
            return res.status(200).json(listaDeEmprestimos);
        } catch (error) {
            // Exibe os detalhes do erro no console do servidor para facilitar o debug
            console.error('Erro ao listar empréstimos:', error);
            // Retorna mensagem de erro com status HTTP 500 (Internal Server Error)
            return res.status(500).json({ mensagem: 'Erro ao listar os empréstimos.' });
        }
    }

 static async emprestimo(req: Request, res: Response): Promise<Response> {
    try {
        const idEmprestimo: number = parseInt(req.params.id as string);
        const emprestimo = await Emprestimo.listarEmprestimo(idEmprestimo);

        return res.status(200).json(emprestimo);
    } catch (error) {
        console.log(`Erro ao acessar método herdado: ${error}`);
        // Corrigido: mensagem dizia "informações do aluno" — corrigido para "empréstimo"
        return res.status(500).json({ mensagem: "Erro ao recuperar as informações do empréstimo." });
    }
}

    /**
     * Cadastra um novo empréstimo.
     * Recebe os dados do empréstimo a partir da requisição e passa para o serviço.
     */
    // Método que recebe os dados do front-end e cria um novo empréstimo no banco de dados
    static async cadastrar(req: Request, res: Response): Promise<Response> {
        try {
            // Lê o corpo da requisição HTTP e tipifica como EmprestimoDTO
            // O front-end envia os dados do novo empréstimo no corpo da requisição em formato JSON
            const dadosRecebidos: EmprestimoDTO = req.body;

            // Cria um novo objeto Emprestimo com os dados recebidos do front-end
            const emprestimo = new Emprestimo(
                dadosRecebidos.aluno.id_aluno,    // ID do aluno — vem do objeto aninhado "aluno" do DTO
                dadosRecebidos.livro.id_livro,    // ID do livro — vem do objeto aninhado "livro" do DTO
                new Date(dadosRecebidos.data_emprestimo), // Converte a data recebida (string) para objeto Date
                dadosRecebidos.status_emprestimo ?? "", // Se não informado, usa string vazia como padrão
                // Se data_devolucao foi informada, converte para Date; senão passa undefined
                // Quando undefined, o construtor de Emprestimo calcula automaticamente (data_emprestimo + 7 dias)
                dadosRecebidos.data_devolucao ? new Date(dadosRecebidos.data_devolucao) : undefined
            );

            // Chama o método do model para persistir o novo empréstimo no banco de dados
            const result = await Emprestimo.cadastrarEmprestimo(emprestimo);

            // Verifica o retorno do model: true = cadastro bem-sucedido, false = falha
            if (result) {
                // Retorna mensagem de sucesso com status HTTP 201 (Created — recurso criado com sucesso)
                return res.status(201).json({ mensagem: 'Empréstimo cadastrado com sucesso.' });
            } else {
                // Retorna mensagem de erro com status HTTP 500 se o banco não conseguiu salvar
                return res.status(500).json({ mensagem: 'Não foi possível cadastrar o livro no banco de dados.' });
            }
        } catch (error) {
            // Exibe o erro no console e retorna status HTTP 500 em caso de exceção inesperada
            console.error('Erro ao cadastrar empréstimo:', error);
            return res.status(500).json({ mensagem: 'Erro ao cadastrar o empréstimo.' });
        }
    }

    /**
     * Atualiza um empréstimo existente.
     * Recebe os dados do empréstimo a partir da requisição e passa para o serviço.
     */
    // Método que recebe os novos dados do front-end e atualiza o empréstimo no banco
    static async atualizar(req: Request, res: Response): Promise<Response> {
    try {
        const dadosRecebidos: EmprestimoDTO = req.body;
        const idEmprestimo = parseInt(req.params.id as string);

        const result = await Emprestimo.atualizarEmprestimo(
            idEmprestimo,
            dadosRecebidos.aluno.id_aluno,
            dadosRecebidos.livro.id_livro,
            new Date(dadosRecebidos.data_emprestimo),
            dadosRecebidos.data_devolucao ? new Date(dadosRecebidos.data_devolucao) : new Date(),
            dadosRecebidos.status_emprestimo ?? ""
        );

        if (result) {
            return res.status(200).json({ mensagem: 'Empréstimo atualizado com sucesso.' });
        } else {
            // Corrigido: mensagem dizia "cadastrar o livro" — corrigido para "atualizar o empréstimo"
            return res.status(500).json({ mensagem: 'Não foi possível atualizar o empréstimo no banco de dados.' });
        }
    } catch (error) {
        console.error('Erro ao atualizar empréstimo:', error);
        return res.status(500).json({ mensagem: 'Erro ao atualizar o empréstimo.' });
    }
}

    /**
    * Método para remover um empréstimo do banco de dados
    * 
    * @param req Objeto de requisição HTTP com o ID do empréstimo a ser removido.
    * @param res Objeto de resposta HTTP.
    * @returns Mensagem de sucesso ou erro em formato JSON.
    */
    // Método que recebe um ID pela URL e realiza a remoção lógica do empréstimo no banco
    static async remover(req: Request, res: Response): Promise<Response> {
        try {
            // Lê o parâmetro "id" da URL e converte para número inteiro
            // Exemplo de URL: DELETE /emprestimo/2  →  idEmprestimo = 2
            const idEmprestimo = parseInt(req.params.id as string);
            // Chama o método do model para remover (logicamente) o empréstimo com o ID informado
            // O resultado é um booleano: true = removido com sucesso, false = não encontrado ou já inativo
            const resultado = await Emprestimo.removerEmprestimo(idEmprestimo);

            // Verifica se a remoção foi bem-sucedida
            if (resultado) {
                // Retorna mensagem de sucesso com status HTTP 200 (OK)
                return res.status(200).json({ mensagem: 'Empréstimo removido com sucesso!' });
            } else {
                // Retorna mensagem de erro com status HTTP 500 se não foi possível remover
                return res.status(500).json({ mensagem: 'Erro ao remover empréstimo!' });
            }

        } catch (error) {
            // Exibe os detalhes do erro no console do servidor
            console.log(`Erro ao remover o Empréstimo ${error}`);
            // Retorna mensagem de erro com status HTTP 500 em caso de exceção inesperada
            return res.status(500).json({ mensagem: "Erro ao remover empréstimo." });
        }
    }
}

// Exporta a classe EmprestimoController para que possa ser importada e usada nas rotas da aplicação
export default EmprestimoController;