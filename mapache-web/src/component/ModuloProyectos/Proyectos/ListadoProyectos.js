import React, { Component }  from 'react';
import axios from 'axios';
import {ButtonGroup, Table, Button} from "react-bootstrap";
import {Link} from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import TableContainer from "@material-ui/core/TableContainer";
import "../../../assets/css/ModuloProyectos/TablasProyectos.css";
import "../../../assets/css/controller/ProyectosScreen.css";
const URL = 'https://mapache-proyectos.herokuapp.com/';

export default class ListadoProyectos extends Component {
    constructor(props) {
        super(props);
        this.state = {
            proyectos : []
        };
    }

    obtenerProyectos(){
        (async() => {
            try {
                axios.get(URL+'proyectos')
                    .then(respuesta => respuesta.data)
                    .then((data) => {
                        this.setState({proyectos : data})
                    });
            } catch (err) {
                let mensaje = "Error: " + err.response.status;
                if(err.response.message){
                    mensaje += ': ' + err.response.message;
                }
                alert(mensaje);
            }
        })();
    }

    componentDidMount() {
        this.obtenerProyectos();
    }

    eliminarProyecto = (proyectoId, estado) => {
        if(estado !== "No iniciado"){
            alert("Los proyecto ya iniciados no se pueden eliminar");
            return;
        }
        (async() => {
            try {
                axios.delete(URL+'proyectos/'+proyectoId)
                    .then(respuesta => {
                        if(respuesta.data != null){
                            alert("El proyecto fue eliminado correctamente");
                            this.obtenerProyectos();
                        }
                    });
            } catch (err) {
                let mensaje = "Error: " + err.response.status;
                if(err.response.message){
                    mensaje += ': ' + err.response.message;
                }
                alert(mensaje);
            }
        })();
    }

    definirColor(estado){
        if(estado === "No iniciado"){
            //negro
            return '#000000';
        } else if(estado === "Activo"){
            //azul
            return '#0033FF';
        } else if(estado === "Suspendido"){
            //gris
            return '#808080';
        } else if(estado === "Cancelado"){
            //rojo
            return '#ff0000';
        } else if(estado === "Finalizado"){
            //verde
            return '#00ff00';
        }
        //negro
        return '#000000';
    }

    render() {
        return (
            <div className="proyectos-screen-div">
                <div className="tablaProyectos">
                    <TableContainer component={Paper}>
                        <Table  aria-label="simple table">
                            <thead>
                            <tr>
                                <th>Id</th>
                                <th>Nombre</th>
                                <th>Estado</th>
                                <th>Tipo de Proyecto</th>
                                <th>Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.proyectos.length === 0 ?
                                <tr align="center">
                                    <td colSpan="4">No existe ningun proyecto</td>
                                </tr> :
                                this.state.proyectos.map((proyecto) => (
                                    <tr key={proyecto.id}>
                                        <td>{proyecto.id}</td>
                                        <td>{proyecto.nombre}</td>
                                        <td
                                            style={{color: this.definirColor(proyecto.estado)}}>
                                            {proyecto.estado}
                                        </td>
                                        <td>{proyecto.tipoDeProyecto}</td>
                                        <td>
                                            <ButtonGroup>
                                                <Link to={"/proyectos/"+proyecto.id}><Button size="sm" variant="outline-primary">
                                                    Edit
                                                </Button>
                                                </Link>
                                                <Button size="sm" variant="outline-primary" onClick={this.eliminarProyecto.bind(this,proyecto.id, proyecto.estado)}>
                                                    Delete
                                                </Button>
                                            </ButtonGroup>
                                        </td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        );
    }
}
