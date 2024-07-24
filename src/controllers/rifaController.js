import {criarRifa, listarRifas,
    buscarRifaPorId,
    comprarBilhetes,
    atualizarRifa,
    buscarRifasPorUsuario,
    buscarGanhadorDaRifa,
    deletarRifa,
    deletarNumerosCompradosPorRifa,
    findUserByNumber} from "../services/rifaService.js"


    export const criarRifaController = async (req,res)=>{
        try {
            const data = req.body;
            const resultado = await criarRifa(data);
          return res.status(201).json({resultado, message:"rifa Criada com sucesso"})
        } catch (error) {
            return res.status(500).json({"error":error.message})
        }
    }



    export const listasRifasController = async (req,res)=>{
        try {
            const resultado = await listarRifas();
          return res.status(200).json(resultado)
        } catch (error) {
            return res.status(500).json({"error":error.message})
        }
    }


    export const listasRifaByIdController = async (req,res)=>{
        const { id } = req.params;
        try {
            const resultado = await buscarRifaPorId(id);
          return res.status(200).json(resultado)
        } catch (error) {
            return res.status(500).json({"error":error.message})
        }
    }



    export const comprarBilhetesController = async (req, res) => {
        const { userId } = req; // Obtendo o ID do usuário da requisição
        const { rifaId, quantidadeBilhetes } = req.body; // Obtendo o ID da rifa e a quantidade de bilhetes do corpo da requisição
    
        try {
            // Validação básica
            if (!userId || !rifaId || !quantidadeBilhetes) {
                return res.status(400).json({ error: 'Parâmetros insuficientes.' });
            }
    
            if (isNaN(quantidadeBilhetes) || quantidadeBilhetes <= 0) {
                return res.status(400).json({ error: 'Quantidade de bilhetes inválida.' });
            }
    
            // Chama o serviço para comprar os bilhetes
            const resultado = await comprarBilhetes(userId, rifaId, quantidadeBilhetes);
    
            if (resultado.success) {
                return res.status(200).json({ resultado, message: 'Bilhetes comprados com sucesso!' });
            } else {
                return res.status(400).json({ error: resultado.message });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };



    export const atualizarRifaController = async (req,res)=>{
        const { id } = req.params;
        const data = req.body;
        try {
            const resultado =  await atualizarRifa(id, data);
          return res.status(200).json({resultado, message:"rifa atualizada com sucesso!"})
        } catch (error) {
            return res.status(500).json({"error":error.message})
        }
    }

    

    export const buscarRifasDeUsuarioController = async (req, res) => {
        const { userId } = req; // Obtendo o ID do usuário da requisição
    
        try {
            const resultado = await buscarRifasPorUsuario(userId);
            return res.status(200).json(resultado);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };


    export const buscarGanhadorController = async (req, res) => {
        const { id } = req.params;
    const resultado = await buscarGanhadorDaRifa(id);
    if (resultado.success) {
        return res.status(200).json({resultado, message:"ok"});
    } else {
        return res.status(404).json(resultado);
    } 
    };



    export const deletarRifaController = async (req, res) => {
        const { id } = req.params;
    const resultado = await deletarRifa(id)

const rifaDeletada = await deletarNumerosCompradosPorRifa(id )
console.log(rifaDeletada)
    if (resultado.success) {
        return res.status(200).json(resultado);
    } else {
        return res.status(404).json(resultado);
    } 
    };


    export const getUserByNumber = async (req, res) => {
        const { rifaId, number } = req.params;
    console.log(rifaId,number)
        try {
            const user = await findUserByNumber(rifaId, number);
            res.status(200).json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    };