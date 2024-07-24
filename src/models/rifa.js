// models/rifa.js
import mongoose from 'mongoose';

const numeroCompradoSchema = new mongoose.Schema({
    numero: { type: String, required: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }  // Mudei isso para uma referência ao User
});

const rifaSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    urlImage: { type: String },
    descricao: { type: String, required: true },
    preco: { type: Number, required: true },
    total_bilhetes: { type: Number, required: true },
    bilhetes_vendidos: { type: Number, default: 0 },
    numeros_comprados: { type: [numeroCompradoSchema], default: [] },
    data_sorteio: { type: Date, required: true },
    sorteada: { type: Boolean, default: false },
    numeroSorteado: { type: String, default: null },
    ganhador: { type: String, default: null }
});

const Rifa = mongoose.model('Rifa', rifaSchema);

export default Rifa;
