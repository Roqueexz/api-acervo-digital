import type AlunoDTO from "../dto/AlunoDTO.js";
import { DatabaseModel } from "./DatabaseModel.js";

// ✅ Pool extraído uma única vez — evita criar nova instância a cada uso
const database = new DatabaseModel().pool;

class Aluno {

    private id_aluno: number = 0;
    private ra: string = "";
    private nome: string;
    private sobrenome: string;
    private data_nascimento: Date;
    private endereco: string;
    private email: string;
    private celular: string;
    private status_aluno: boolean = true;

    constructor(
        _nome: string,
        _sobrenome: string,
        _data_nascimento: Date,
        _endereco: string,
        _email: string,
        _celular?: string
    ) {
        this.nome = _nome;
        this.sobrenome = _sobrenome;
        this.data_nascimento = _data_nascimento;
        this.endereco = _endereco;
        this.email = _email;
        this.celular = _celular ?? "";
    }

    public getIdAluno(): number { return this.id_aluno; }
    public setIdAluno(id_aluno: number): void { this.id_aluno = id_aluno; }

    public getRa(): string { return this.ra; }
    public setRa(ra: string): void { this.ra = ra; }

    // ✅ Getters/Setters duplicados do RA removidos (getRA/setRA eram idênticos)

    public getNome(): string { return this.nome; }
    public setNome(nome: string): void { this.nome = nome; }

    public getSobrenome(): string { return this.sobrenome; }
    public setSobrenome(sobrenome: string): void { this.sobrenome = sobrenome; }

    public getDataNascimento(): Date { return this.data_nascimento; }
    public setDataNascimento(data_nascimento: Date): void { this.data_nascimento = data_nascimento; }

    public getEndereco(): string { return this.endereco; }
    public setEndereco(endereco: string): void { this.endereco = endereco; }

    public getEmail(): string { return this.email; }
    public setEmail(email: string): void { this.email = email; }

    public getCelular(): string { return this.celular; }
    public setCelular(celular: string): void { this.celular = celular; }

    public getStatusAluno(): boolean { return this.status_aluno; }
    public setStatusAluno(status_aluno: boolean): void { this.status_aluno = status_aluno; }

    // ==================== MÉTODOS ESTÁTICOS (operações no banco de dados) ====================
    // Métodos "static" pertencem à classe, não ao objeto — são chamados como Aluno.listarAlunos()

    /**
     * Retorna uma lista com todos os alunos cadastrados no banco de dados
     * 
     * @returns Lista com todos os alunos cadastrados no banco de dados
     */
    // "async" indica que este método é assíncrono — ele pode "esperar" por operações demoradas (como banco de dados)
    // Retorna uma Promise que, quando resolvida, contém um Array de AlunoDTO ou null
    static async listarAlunos(): Promise<Array<AlunoDTO> | null> {
    try {
        const querySelectAluno = `SELECT * FROM Aluno WHERE status_aluno = TRUE;`;
        const respostaBD = await database.query(querySelectAluno);

        // ✅ map é mais idiomático para transformar arrays
        const listaDeAlunos: Array<AlunoDTO> = respostaBD.rows.map((aluno: any) => ({
            id_aluno: aluno.id_aluno,
            ra: aluno.ra,
            nome: aluno.nome,
            sobrenome: aluno.sobrenome,
            data_nascimento: aluno.data_nascimento,
            endereco: aluno.endereco,
            email: aluno.email,
            celular: aluno.celular,
            status_aluno: aluno.status_aluno
        }));

        return listaDeAlunos;
    } catch (error) {
        console.log(`Erro ao acessar o modelo: ${error}`);
        return null;
    }
}

    /**
     * Retorna as informações de um aluno informado pelo ID
     * 
     * @param idAluno Identificador único do aluno
     * @returns Objeto com informações do aluno
     */
    // Recebe o ID do aluno como parâmetro e retorna um AlunoDTO ou null
   static async listarAluno(id_aluno: number): Promise<AlunoDTO | null> {
    try {
        const querySelectAluno = `SELECT * FROM aluno WHERE id_aluno = $1`;
        const respostaBD = await database.query(querySelectAluno, [id_aluno]);

        if (respostaBD.rows.length === 0) return null;

        // Destructuring: extrai as propriedades do objeto rows[0] diretamente em variáveis,
        // evitando repetir respostaBD.rows[0].x em cada linha. O "id_aluno: id" renomeia
        // a propriedade para "id" pois já existe um parâmetro chamado id_aluno no escopo.
        const { id_aluno: id, nome, sobrenome, data_nascimento, endereco, email, celular, ra, status_aluno } = respostaBD.rows[0];

        const alunoDTO: AlunoDTO = {
            id_aluno: id, nome, sobrenome, data_nascimento,
            endereco, email, celular, ra, status_aluno
        };

        return alunoDTO;
    } catch (error) {
        console.log(`Erro ao realizar a consulta: ${error}`);
        return null;
    }
}

    
   static async cadastrarAluno(aluno: Aluno): Promise<boolean> {
    try {
        const queryInsertAluno = `INSERT INTO Aluno (nome, sobrenome, data_nascimento, endereco, email, celular)
                                  VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_aluno;`;

        // Valores extraídos em array separado — evita uma lista longa dentro do database.query,
        // tornando o código mais fácil de ler e de adicionar/remover campos no futuro
        const valores = [
            aluno.getNome().toUpperCase(),
            aluno.getSobrenome().toUpperCase(),
            aluno.getDataNascimento(),
            aluno.getEndereco().toUpperCase(),
            aluno.getEmail().toLowerCase(),
            aluno.getCelular()
        ];

        const result = await database.query(queryInsertAluno, valores);

        if (result.rows.length > 0) {
            console.log(`Aluno cadastrado com sucesso. ID: ${result.rows[0].id_aluno}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error(`Erro ao cadastrar aluno: ${error}`);
        return false;
    }
}

   static async removerAluno(id_aluno: number): Promise<boolean> {
    try {
        const aluno: AlunoDTO | null = await this.listarAluno(id_aluno);

        if (aluno && aluno.status_aluno) {
            const queryDeleteEmprestimoAluno = `UPDATE emprestimo 
                                                SET status_emprestimo_registro = FALSE
                                                WHERE id_aluno = $1;`;

            await database.query(queryDeleteEmprestimoAluno, [id_aluno]);

            const queryDeleteAluno = `UPDATE aluno 
                                      SET status_aluno = FALSE
                                      WHERE id_aluno = $1;`;

            const result = await database.query(queryDeleteAluno, [id_aluno]);

            // Corrigido: antes retornava true sem verificar se o UPDATE afetou alguma linha.
            // rowCount ?? 0 garante que se rowCount for null, trate como 0
            return (result.rowCount ?? 0) > 0;
        }

        return false;
    } catch (error) {
        console.log(`Erro na consulta: ${error}`);
        return false;
    }
}

    /**
    * Atualiza os dados de um aluno no banco de dados.
    * @param aluno Objeto do tipo Aluno com os novos dados
    * @returns true caso sucesso, false caso erro
    */
    // Recebe um objeto Aluno com os dados atualizados e os salva no banco
    static async atualizarAluno(aluno: Aluno): Promise<boolean> {
        try {
            // Antes de atualizar, verifica se o aluno existe e está ativo no banco
            const alunoConsulta: AlunoDTO | null = await this.listarAluno(aluno.id_aluno);

            // Só prossegue com a atualização se o aluno existir e estiver ativo
            if (alunoConsulta && alunoConsulta.status_aluno) {
                // Query SQL de atualização — cada campo recebe um placeholder "$n"
                // O WHERE garante que só o aluno com o ID correto seja atualizado
               const queryAtualizarAluno = `UPDATE Aluno SET 
                                nome = $1, 
                                sobrenome = $2,
                                data_nascimento = $3, 
                                endereco = $4,
                                celular = $5, 
                                email = $6                                            
                            WHERE id_aluno = $7`;
                // Executa a query de atualização com os valores do objeto aluno recebido
                const respostaBD = await database.query(queryAtualizarAluno, [
                    aluno.getNome().toUpperCase(),       // Nome em maiúsculas
                    aluno.getSobrenome().toUpperCase(),  // Sobrenome em maiúsculas
                    aluno.getDataNascimento(),           // Data de nascimento
                    aluno.getEndereco().toUpperCase(),   // Endereço em maiúsculas
                    aluno.getCelular(),                  // Celular
                    aluno.getEmail().toLowerCase(),      // E-mail em minúsculas
                    aluno.id_aluno                       // ID do aluno (para o WHERE)
                ]);

                // Se rowCount for diferente de 0, a atualização funcionou — retorna true
                if (respostaBD.rowCount != 0) {
                    return true;
                }
            }

            // Se o aluno não existe, está inativo, ou o UPDATE não afetou nenhuma linha, retorna false
            return false;
        } catch (error) {
            // Exibe o erro no console e retorna false em caso de exceção
            console.log(`Erro na consulta: ${error}`);
            return false;
        }
    }

}

// Exporta a classe Aluno para que possa ser importada e usada em outros arquivos do projeto
export default Aluno;