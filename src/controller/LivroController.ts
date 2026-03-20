// Importa a classe Livro do model — é daqui que vêm os métodos de acesso ao banco de dados
import Livro from "../model/Livro.js";
// Importa os tipos Request e Response do Express — representam a requisição e a resposta HTTP
import { type Request, type Response } from "express";
// Importa o tipo LivroDTO para tipar os dados recebidos do front-end
import type LivroDTO from "../dto/LivroDTO.js";

// Define a classe LivroController que HERDA da classe Livro
// A herança permite acessar os métodos estáticos do model diretamente
// O controller é responsável por receber as requisições HTTP e devolver as respostas — nunca acessa o banco diretamente
class LivroController extends Livro {

    // Método que busca todos os livros ativos e os retorna em formato JSON
    // ⚠️ Diferença dos outros controllers: este método não tem JSDoc (comentário de documentação acima dele)
   static async todos(req: Request, res: Response): Promise<Response> {
    try {
        const listaDeLivros = await Livro.listarLivros();
        return res.status(200).json(listaDeLivros);
    } catch (error) {
        console.error(`Erro ao listar livros: ${error}`);
        return res.status(500).json({ mensagem: "Erro ao recuperar as informações dos livros." });
    }
}

    // Método que busca um único livro com base no ID informado na URL (ex: GET /livro/3)
   static async livro(req: Request, res: Response): Promise<Response> {
    try {
        const idLivro = parseInt(req.params.id as string);
        const livro = await Livro.listarLivro(idLivro);
        return res.status(200).json(livro);
    } catch (error) {
        console.log(`Erro ao acessar método herdado: ${error}`);
        return res.status(500).json({ mensagem: "Erro ao recuperar as informações do livro." });
    }
}

    // Método que recebe os dados do front-end e cria um novo livro no banco de dados
    static async cadastrar(req: Request, res: Response): Promise<Response> {
    try {
        const dadosRecebidos: LivroDTO = req.body;

        const novoLivro = new Livro(
            dadosRecebidos.titulo,
            dadosRecebidos.autor,
            dadosRecebidos.editora,
            (dadosRecebidos.ano_publicacao ?? 0).toString(),
            dadosRecebidos.isbn,
            dadosRecebidos.quant_total,
            dadosRecebidos.quant_disponivel,
            dadosRecebidos.quant_aquisicao,
            dadosRecebidos.valor_aquisicao ?? 0
        );

        const result = await Livro.cadastrarLivro(novoLivro);

        if (result) {
            // Corrigido: status 200 trocado por 201 — criação de recurso deve retornar 201
            return res.status(201).json({ mensagem: 'Livro cadastrado com sucesso.' });
        } else {
            return res.status(500).json({ mensagem: 'Não foi possível cadastrar o livro no banco de dados.' });
        }
    } catch (error) {
        console.error(`Erro ao cadastrar o livro: ${error}`);
        return res.status(500).json({ mensagem: 'Erro ao cadastrar o livro.' });
    }
}
    // Método que recebe um ID pela URL e realiza a remoção lógica do livro no banco
    // "Promise<Response>" indica que este método sempre retorna uma resposta HTTP ao final
  static async remover(req: Request, res: Response): Promise<Response> {
    try {
        const idLivro = parseInt(req.params.id as string);
        const result = await Livro.removerLivro(idLivro);

        if (result) {
            // Corrigido: status 201 trocado por 200 — remoção de recurso deve retornar 200
            return res.status(200).json({ mensagem: 'Livro removido com sucesso.' });
        } else {
            return res.status(404).json({ mensagem: 'Livro não encontrado para exclusão.' });
        }
    } catch (error) {
        console.error("Erro ao remover o livro: ", error);
        return res.status(500).json({ mensagem: 'Erro ao remover o livro.' });
    }
}
    // Método que recebe os novos dados do front-end e atualiza o cadastro do livro no banco
   static async atualizar(req: Request, res: Response): Promise<Response> {
    try {
        const idLivro = parseInt(req.params.id as string);
        const dadosRecebidos: LivroDTO = req.body;

        const livro = new Livro(
            dadosRecebidos.titulo,
            dadosRecebidos.autor,
            dadosRecebidos.editora,
            (dadosRecebidos.ano_publicacao ?? 0).toString(),
            dadosRecebidos.isbn,
            dadosRecebidos.quant_total,
            dadosRecebidos.quant_disponivel,
            dadosRecebidos.quant_aquisicao,
            dadosRecebidos.valor_aquisicao ?? 0
        );

        livro.setIdLivro(idLivro);

        const sucesso = await Livro.atualizarLivro(livro);

        if (sucesso) {
            return res.status(200).json({ mensagem: "Cadastro atualizado com sucesso!" });
        } else {
            return res.status(400).json({ mensagem: "Não foi possível atualizar o livro no banco de dados." });
        }
    } catch (error) {
        console.error(`Erro ao atualizar livro: ${error}`);
        return res.status(500).json({ mensagem: "Erro ao atualizar o livro." });
    }
}
}

// Exporta a classe LivroController para que possa ser importada e usada nas rotas da aplicação
export default LivroController;