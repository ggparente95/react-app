import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import NavBar from "../component/general/NavBar";
import { Home } from "../controller/Home";
import EmpleadosScreen from "../controller/EmpleadosScreen";
import SoporteScreen from "../controller/SoporteScreen";
import ProyectosScreen from "../controller/ProyectosScreen";
import ClientesScreen from "../controller/ClientesScreen";
import EditorProyectosScreen from "../component/ModuloProyectos/Proyectos/EditorProyectosScreen";

import PerfilEmpleado from "../component/recursos/PerfilEmpleado";
import CrearTicket from '../component/soporte/CrearTicket';
import EditarTicket from '../component/soporte/EditarTicket';
import InfoCliente from '../component/soporte/InfoCliente';
import EditorFasesScreen from "../component/ModuloProyectos/Fases/EditorFasesScreen";

class Routes extends Component {
    render() {
        return (
            <Router key="router">
                <NavBar />
                <Route exact path={"/"} component={Home} />

                {/* Rutas Recursos */}
                <Route exact path={"/empleados"} component={ EmpleadosScreen }/>
                <Route exact path={`/empleados/:legajo`} component={ PerfilEmpleado }/>

                {/* Rutas Proyectos */}
                <Route exact path={"/proyectos"} component={ ProyectosScreen }/>
                <Route exact path={"/proyectos/:id/fases"} component={ EditorFasesScreen }/>
                <Route exact path={"/proyectos/:id"} component={ EditorProyectosScreen }/>

                {/* Rutas Soporte */}
                <Route exact path={"/soporte"} component={ SoporteScreen }/>
                <Route exact path={`/soporte/tickets/nuevo`} component={ CrearTicket }/>
                <Route exact path={`/tickets/:id_ticket`} component={ EditarTicket }/>

                {/* Rutas Clientes */}
                <Route exact path={"/clientes"} component={ ClientesScreen }/>
                <Route exact path={[`/clientes/nuevo`, `/clientes/:id_cliente`]} component={ InfoCliente }/>
            </Router>
        )
    }
}

export default Routes;
