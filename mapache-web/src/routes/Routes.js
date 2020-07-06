import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import NavBar from "../component/general/NavBar";
import { Home } from "../controller/Home";
import EmpleadosScreen from "../controller/EmpleadosScreen";
import SoporteScreen from "../controller/SoporteScreen";
import ProyectosScreen from "../controller/ProyectosScreen";

import PerfilEmpleado from "../component/recursos/PerfilEmpleado";
import CrearTicket from '../component/soporte/CrearTicket';
import VisualizarTicket from '../component/soporte/VisualizarTicket';

class Routes extends Component {
    render() {
        return (
            <Router key="router">
                <NavBar />
                <Route exact path={"/"} component={Home} />
                <Route exact path={"/empleados"} component={ EmpleadosScreen }/>
                <Route exact path={"/proyectos"} component={ ProyectosScreen }/>
                <Route exact path={"/soporte"} component={ SoporteScreen }/>
                <Route exact path={`/empleados/:legajo`} component={ PerfilEmpleado }/>
                <Route exact path={`/soporte/tickets/nuevo`} component={ CrearTicket }/>
                <Route exact path={`/soporte/:id_ticket`} component={ VisualizarTicket }/>
            </Router>
        )
    }
}

export default Routes;