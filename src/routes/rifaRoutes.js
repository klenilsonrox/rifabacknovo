import { Router } from "express";
import { atualizarRifaController, buscarGanhadorController, buscarRifasDeUsuarioController, comprarBilhetesController, criarRifaController, deletarRifaController, getUserByNumber, listasRifaByIdController, listasRifasController } from "../controllers/rifaController.js";
import { isAuthenticated } from "../middlewares/authenticate.js";
import { isAdmin } from "../middlewares/verifyAdmin.js";


const routerRifas = Router()

routerRifas.get("/rifas", listasRifasController)
routerRifas.post("/rifas", isAuthenticated, isAdmin, criarRifaController)
routerRifas.get("/rifas/:id", listasRifaByIdController)
routerRifas.post("/rifas/comprar", isAuthenticated, comprarBilhetesController)
routerRifas.put("/rifas/:id", isAuthenticated,isAdmin, atualizarRifaController)
routerRifas.get("/rifas/usuario/:userId", isAuthenticated, buscarRifasDeUsuarioController)
routerRifas.get('/rifas/:rifaId/numero/:number', getUserByNumber);
routerRifas.delete("/rifas/:id", isAuthenticated, deletarRifaController)

export default routerRifas