import Rifa from "../models/rifa.js";
import User from "../models/user.js";


export const criarRifa = async (data) => {
    try {
        const novaRifa = new Rifa(data);
        await novaRifa.save();
        return { success: true, rifa: novaRifa };
    } catch (error) {
        return { success: false, message: error.message };
    }
};  


export const listarRifas = async () => {
    try {
        const rifas = await Rifa.find()
            .populate({
                path: 'numeros_comprados.usuario',  // Nome do campo a ser populado
                select: 'nome email'  // Campos a serem retornados
            });
        return { success: true, rifas };
    } catch (error) {
        return { success: false, message: error.message };
    }  
};




const gerarNumerosAleatorios = (quantidade, totalBilhetes, numerosExistentes) => {
    const numerosComprados = new Set();
    while (numerosComprados.size < quantidade) {
        const numero = Math.floor(Math.random() * totalBilhetes);
        if (!numerosExistentes.includes(numero.toString()) && !numerosComprados.has(numero.toString())) {
            numerosComprados.add(numero.toString());
        }
    }
    return Array.from(numerosComprados);
};

export const comprarBilhetes = async (userId, rifaId, quantidadeBilhetes) => {
    try {
        const rifa = await Rifa.findById(rifaId);
        if (!rifa) {
            throw new Error('Rifa não encontrada');
        }

        if (rifa.sorteada) {
            throw new Error('Rifa já foi sorteada');
        }

        if (rifa.bilhetes_vendidos + quantidadeBilhetes > rifa.total_bilhetes) {
            throw new Error('Não há bilhetes suficientes disponíveis');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        // Verificar se o usuário já comprou bilhetes demais
        const totalBilhetesComprados = user.numeros_comprados.filter(
            num => num.rifa.toString() === rifaId.toString()
        ).length;

        if (totalBilhetesComprados + quantidadeBilhetes > 10000) {
            throw new Error('Cada usuário pode comprar no máximo 10.000 bilhetes');
        }

        // Obter números comprados existentes
        const numerosExistentes = rifa.numeros_comprados.map(n => n.numero);

        // Gerar números aleatórios únicos
        const numerosComprados = gerarNumerosAleatorios(quantidadeBilhetes, rifa.total_bilhetes, numerosExistentes);

        // Atualizar a rifa com os números comprados
        numerosComprados.forEach(numero => {
            rifa.numeros_comprados.push({ numero, usuario: userId });  // Adiciona o usuário
        });
        rifa.bilhetes_vendidos += quantidadeBilhetes;
        await rifa.save();

        // Atualizar o usuário com os números comprados
        numerosComprados.forEach(numero => {
            user.numeros_comprados.push({ numero, rifa: rifaId });  // Adiciona a rifa
        });
        user.numeros_comprados.sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
        await user.save();

        return { success: true, message: 'Bilhetes comprados com sucesso!', rifa, user, numerosComprados };
    } catch (error) {
        return { success: false, message: error.message };
    }
};


export const buscarRifaPorId = async (id) => {
    try {
        const rifa = await Rifa.findById(id).populate('numeros_comprados.usuario', 'nome email');
        if (!rifa) {
            return { success: false, message: 'Rifa não encontrada' };
        }
        return { success: true, rifa };
    } catch (error) {
        return { success: false, message: error.message };
    }
};



export const atualizarRifa = async (id, data) => {
    try {
        const rifaAtualizada = await Rifa.findByIdAndUpdate(id, data, { new: true });
        if (!rifaAtualizada) {
            return { success: false, message: 'Rifa não encontrada' };
        }
        return { success: true, rifa: rifaAtualizada };
    } catch (error) {
        return { success: false, message: error.message };
    }
};



export const buscarRifasPorUsuario = async (userId) => {
    try {
        // Encontra rifas onde o usuário tem números comprados
        const rifas = await Rifa.find({ 'numeros_comprados.usuario': userId }).populate('numeros_comprados.usuario', 'nome email');
        
        if (!rifas.length) {
            return { success: false, message: 'Nenhuma rifa encontrada para o usuário' };
        }

        // Filtra números comprados para incluir apenas os do usuário logado
        const rifasFiltradas = rifas.map(rifa => {
            const numerosCompradosUsuario = rifa.numeros_comprados.filter(numero => numero.usuario._id.toString() === userId);
            console.log(numerosCompradosUsuario)
            return {
                ...rifa.toObject(),
                numeros_comprados: numerosCompradosUsuario
            };
        });

        

        return { success: true, rifas: rifasFiltradas };
    } catch (error) {
        return { success: false, message: error.message };
    }
};


export const buscarGanhadorDaRifa = async (rifaId) => {
    try {
        // Buscar a rifa pelo ID
        const rifa = await Rifa.findById(rifaId).populate('numeros_comprados.usuario', 'nome email');
        if (!rifa) {
            return { success: false, message: 'Rifa não encontrada' };
        }

        // Verificar se a rifa foi sorteada e tem um ganhador
        if (!rifa.sorteada) {
            return { success: false, message: 'A rifa ainda não foi sorteada' };
        }

        if (!rifa.ganhador) {
            return { success: false, message: 'Nenhum ganhador encontrado para esta rifa' };
        }

        // Encontrar o número comprado pelo ganhador
        const ganhadorNumero = rifa.numeros_comprados.find(n => n.numero === rifa.numeroSorteado);
        if (!ganhadorNumero) {
            return { success: false, message: 'Número sorteado não encontrado nos números comprados' };
        }

        // Obter as informações do usuário ganhador
        const ganhador = ganhadorNumero.usuario;

        return { success: true, ganhador, numeroSorteado: rifa.numeroSorteado };
    } catch (error) {
        return { success: false, message: error.message };
    }
};


export const deletarRifa = async (id) => {
    try {
        // Encontrar e remover a rifa pelo ID
        const rifa = await Rifa.findByIdAndDelete(id);
        if (!rifa) {
            return { success: false, message: 'Rifa não encontrada' };
        }
        return { success: true, message: 'Rifa deletada com sucesso' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

export const deletarNumerosCompradosPorRifa = async (rifaId) => {
    try {
        // Encontrar todos os usuários que compraram números da rifa
        const usuarios = await User.find({ 'numeros_comprados.rifa': rifaId });

        if (usuarios.length === 0) {
            return { success: true, message: 'Nenhum número comprado encontrado para esta rifa' };
        }

        // Atualizar cada usuário para remover os números comprados relacionados à rifa
        for (const usuario of usuarios) {
            usuario.numeros_comprados = usuario.numeros_comprados.filter(
                num => num.rifa.toString() !== rifaId.toString()
            );
            await usuario.save();
        }

        return { success: true, message: 'Números comprados removidos com sucesso' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};


export const findUserByNumber = async (rifaId, number) => {
    try {
        const rifa = await Rifa.findById(rifaId).populate('numeros_comprados.usuario', 'nome email');

        if (!rifa) {
            throw new Error('Rifa not found');
        }

        // if (!rifa.sorteada) {
        //     throw new Error('Essa Rifa ainda nao foi sorteada');
        // }

        const numeroComprado = rifa.numeros_comprados.find(num => num.numero === number);

        if (!numeroComprado) {
            throw new Error('Este número nao foi comprado');
        }

        const user = numeroComprado.usuario
        const status = 200

        return {user,status};
    } catch (error) {
        throw new Error(error.message);
    }
};