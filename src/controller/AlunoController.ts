import Aluno from "../model/Aluno.js";
import { type Request, type Response } from "express";
import type AlunoDTO from "../dto/AlunoDTO.js";

// ⚠️ AlunoController herda de Aluno apenas para acessar seus métodos estáticos.
// O ideal seria não usar herança aqui, mas sim chamar Aluno.metodo() diretamente,
// pois herança deve representar uma relação "é um" — um Controller não é um Model.
class AlunoController extends Aluno {

static async todos(req: Request, res: Response): Promise<Response> {
    try {
        const listaDeAlunos = await Aluno.listarAlunos();
        return res.status(200).json(listaDeAlunos);
    } catch (error) {
        console.log(`Erro ao acessar método herdado: ${error}`);
        return res.status(500).json({ mensagem: "Erro ao recuperar as informações do aluno." });
    }
}

   static async aluno(req: Request, res: Response): Promise<Response> {
    try {
        const idAluno = parseInt(req.params.id as string);
        const aluno = await Aluno.listarAluno(idAluno);
        return res.status(200).json(aluno);
    } catch (error) {
        console.log(`Erro ao acessar método herdado: ${error}`);
        return res.status(500).json({ mensagem: "Erro ao recuperar as informações do aluno." });
    }
}

    /**
      * Cadastra um novo aluno.
      * @param req Objeto de requisição HTTP com os dados do aluno.
      * @param res Objeto de resposta HTTP.
      * @returns Mensagem de sucesso ou erro em formato JSON.
      */
    // Método que recebe os dados do front-end e cria um novo aluno no banco de dados
    static async cadastrar(req: Request, res: Response) {
        try {
            // Lê o corpo (body) da requisição HTTP e o tipifica como AlunoDTO
            // O front-end envia os dados do novo aluno no corpo da requisição (geralmente em formato JSON)
            const dadosRecebidos: AlunoDTO = req.body;

            // Cria um novo objeto Aluno usando os dados recebidos do front-end
            // O operador "??" define valores padrão caso os campos opcionais não tenham sido enviados
            const novoAluno = new Aluno(
                dadosRecebidos.nome,                                      // Nome obrigatório
                dadosRecebidos.sobrenome,                                 // Sobrenome obrigatório
                dadosRecebidos.data_nascimento ?? new Date("1900-01-01"), // Se não informado, usa 01/01/1900
                dadosRecebidos.endereco ?? '',                            // Se não informado, usa string vazia
                dadosRecebidos.email ?? '',                               // Se não informado, usa string vazia
                dadosRecebidos.celular                                    // Celular opcional (pode ser undefined)
            );

            // Chama o método do model para persistir (salvar) o novo aluno no banco de dados
            const result = await Aluno.cadastrarAluno(novoAluno);

            // Verifica o retorno do model: true = cadastro bem-sucedido, false = falha
            if (result) {
                // Retorna mensagem de sucesso com status HTTP 201 (Created — recurso criado com sucesso)
                return res.status(201).json({ mensagem: `Aluno cadastrado com sucesso.` });
            } else {
                // Retorna mensagem de erro com status HTTP 500 se o banco não conseguiu salvar
                return res.status(500).json({ mensagem: 'Não foi possível cadastrar o aluno no banco de dados.' });
            }
        } catch (error) {
            // Exibe o erro no console e retorna status HTTP 500 em caso de exceção inesperada
            console.log(`Erro ao cadastrar o aluno: ${error}`);
            return res.status(500).json({ mensagem: 'Erro ao cadastrar o aluno.' });
        }
    }

    /**
     * Remove um aluno.
     * @param req Objeto de requisição HTTP com o ID do aluno a ser removido.
     * @param res Objeto de resposta HTTP.
     * @returns Mensagem de sucesso ou erro em formato JSON.
     */
    // Método que recebe um ID pela URL e realiza a remoção lógica do aluno no banco
    // "Promise<Response>" indica que este método sempre retorna uma resposta HTTP ao final
   static async remover(req: Request, res: Response): Promise<Response> {
    try {
        const idAluno = parseInt(req.params.id as string);
        const result = await Aluno.removerAluno(idAluno);

        if (result) {
            // Corrigido: status 201 trocado por 200 — remoção de recurso deve retornar 200
            return res.status(200).json({ mensagem: 'Aluno removido com sucesso.' });
        } else {
            return res.status(404).json({ mensagem: 'Aluno não encontrado para exclusão.' });
        }
    } catch (error) {
        console.log(`Erro ao remover aluno: ${error}`);
        return res.status(500).json({ mensagem: 'Erro ao remover aluno.' });
    }
}

    /**
     * Método para atualizar o cadastro de um aluno.
     * 
     * @param req Objeto de requisição do Express, contendo os dados atualizados do aluno
     * @param res Objeto de resposta do Express
     * @returns Retorna uma resposta HTTP indicando sucesso ou falha na atualização
     */
    // Método que recebe os novos dados do front-end e atualiza o cadastro do aluno no banco
    static async atualizar(req: Request, res: Response): Promise<Response> {
        try {
            // Lê o corpo da requisição e tipifica como AlunoDTO
            // O front-end envia os dados atualizados no corpo da requisição
            const dadosRecebidos: AlunoDTO = req.body;

            // Cria um novo objeto Aluno com os dados atualizados recebidos do front-end
            // Mesma lógica do método cadastrar — usa "??" para garantir valores padrão nos campos opcionais
            const aluno = new Aluno(
                dadosRecebidos.nome,
                dadosRecebidos.sobrenome,
                dadosRecebidos.data_nascimento ?? new Date("1900-01-01"),
                dadosRecebidos.endereco ?? '',
                dadosRecebidos.email ?? '',
                dadosRecebidos.celular
            );

            // Define o ID do aluno no objeto criado, lendo o parâmetro "id" da URL
            // Isso é necessário para que o model saiba QUAL aluno deve ser atualizado no banco
            // Exemplo de URL: PUT /aluno/7  →  setIdAluno(7)
            aluno.setIdAluno(parseInt(req.params.id as string));

            // Chama o método do model para atualizar os dados do aluno no banco de dados
            const result = await Aluno.atualizarAluno(aluno);

            // Verifica o retorno do model: true = atualização bem-sucedida, false = falha
            if (result) {
                // Retorna mensagem de sucesso com status HTTP 200 (OK)
                return res.status(200).json({ mensagem: "Cadastro atualizado com sucesso." });
            } else {
                // Retorna mensagem de erro com status HTTP 500 se o banco não conseguiu atualizar
                return res.status(500).json({ mensagem: 'Não foi possível atualizar o aluno no banco de dados.' });
            }
        } catch (error) {
            // Registra o erro nos logs do servidor
            console.error(`Erro ao atualizar aluno: ${error}`);
            // Retorna mensagem de erro com status HTTP 500 em caso de exceção inesperada
            return res.status(500).json({ mensagem: "Erro ao atualizar aluno." });
        }
    }
}

// Exporta a classe AlunoController para que possa ser importada e usada nas rotas da aplicação
export default AlunoController;