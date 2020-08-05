import React, { Component } from 'react';
import { withRouter } from 'react-router';

import "../../assets/css/component/recursos/TabEstadisticas.css";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { Fecha } from "./TabHorasCargadas";
import { Dropdown } from "../general/Dropdown";
import { DatePicker } from "../general/DatePicker";
import { Alerta } from "../general/Alerta";

import RequesterHoras from "../../communication/RequesterHoras";

am4core.useTheme(am4themes_animated);

class TabEstadisticas extends Component {

    constructor(props) {
        super(props);

        this.fechaHoy = new Fecha(new Date());

        this.state = {
            data: [],
            frecuencia: frecuencias[0].value,
            fechaSeleccionada: this.fechaHoy.fechaProcesadaGuion
        }

        this.requesterHoras = new RequesterHoras();

        this.handleFrecuenciaChange = this.handleFrecuenciaChange.bind(this);
        this.handleDateInput = this.handleDateInput.bind(this);
        
        this.obtenerHorasSemana = this.obtenerHorasSemana.bind(this);
    }

    async componentDidMount() {
        let legajo = this.props.match.params.legajo;
        let horas = [];
        console.log("Did mount ", this.state.frecuencia);
        if (this.state.frecuencia === 0) {
            console.log("En if");
            horas = await this.requesterHoras.obtenerHorasCargadasEnUnDia(
                legajo, 
                this.state.fechaSeleccionada, 
                this.props.mostrarAlerta
            );
            console.log("Horas", horas);
        }
        
        console.log("Horas cargadas ", horas);
        this.setState({
            data: horas
        })
    }

    handleFrecuenciaChange(event) {
        this.setState({
            frecuencia: event.target.value
        });
    }

    handleDateInput(event) {
        this.setState({
            fechaSeleccionada: event.target.value
        });
    }

    async obtenerHorasSemana() {
        const fecha = this.state.fechaSeleccionada ? new Date(this.state.fechaSeleccionada) : new Date();
        const horasCargadas = await this.requesterHoras.obtenerHorasCargadasSemana(
            this.props.match.params.legajo, 
            fecha
        );
        return horasCargadas;
    }

    render() {

        const fechaHoy = new Fecha(new Date());
        let fecha = this.state.fechaSeleccionada 
                        ? this.state.fechaSeleccionada : 
                        fechaHoy.fechaProcesadaGuion;
        let fechaFormatoDate = this.state.fechaSeleccionada ? 
                new Date(this.state.fechaSeleccionada) : new Date();
        
        let chart = <ChartDiario></ChartDiario>
        let label = '';
        if (this.state.frecuencia === 0) {
            chart = <ChartDiario
                        fechaSeleccionada={ fecha }
                        data={ this.state.data }
                    ></ChartDiario>
            label = `Ocupación del empleado en el día ${ fecha }`;
        } else if (this.state.frecuencia === 1) {
            chart = <ChartSemanal
                        fechaSeleccionada={ this.state.fechaSeleccionada }
                        horasCargadas={ this.obtenerHorasSemana() }
                    ></ChartSemanal>
            label = `Ocupación del empleado en la semana ${ fecha } - ${ fecha }`;
        } else if (this.state.frecuencia === 2) {
            chart = <ChartMensual
                        fechaSeleccionada={ this.state.fechaSeleccionada }
                    ></ChartMensual>
            label = `Ocupación del empleado en el mes ${ fechaFormatoDate.getMonth() + 1 }`;
        } else if (this.state.frecuencia === 3) {
            chart = <ChartAnual
                        fechaSeleccionada={ this.state.fechaSeleccionada }
                    ></ChartAnual>
            label = `Ocupación del empleado en el año ${ fechaFormatoDate.getFullYear() }`;
        }

        let alerta = null;
        if (this.state.mostrarAlerta) {
            alerta = <Alerta
                        open={ true }
                        mensaje={ this.state.mensajeAlerta }
                        tipo={ this.state.tipoAlerta }
                        handleClose={ this.handleCloseAlerta }
                     >
                     </Alerta>
        }

        return (
            <div className="tab-estadisticas-div">
                <Paper square> 
                    <div className="header-div">
                        <Typography variant="h6">
                            Disponibilidad: Full-Time (40 hs semanales)
                        </Typography>                        
                        <DatePicker 
                            label="Fecha"
                            handleDateInput={ this.handleDateInput }
                        ></DatePicker>
                        <Dropdown
                            renderDropdown={ true }
                            label="Frecuencia"
                            value={ this.state.frecuencia }
                            values={ frecuencias }
                            handleChange={ this.handleFrecuenciaChange }
                        >
                        </Dropdown> 
                    </div>
                    <div className="chart-div">
                        { chart }
                    </div>
                    <div className="footer-div">
                        <Typography variant="subtitle1" align="center">
                            { label }
                        </Typography>      
                    </div>
                </Paper>
                { alerta }
            </div>
        )
    }

}

export default withRouter(TabEstadisticas);

const frecuencias = [
    {
        name: "Diaria",
        value: 0
    },
    {
        name: "Semanal",
        value: 1
    },
    {
        name: "Mensual",
        value: 2
    },
    {
        name: "Anual",
        value: 3
    }
]

class ChartDiario extends Component {

    procesarDataDiaria(data) {
        let horasOcupadas = 0;
        
        const totalHorasDia = 9;
        data.forEach((data) => {
            horasOcupadas += data.cantidadHoras;
        });

        let horasNoOcupadas = totalHorasDia - horasOcupadas;
        let horasDisponibles = 9; 

        return [
            { "actividad": "Ocupado", "size": horasOcupadas },
            { "actividad": "No ocupado", "size": horasNoOcupadas },
            { "actividad": "Disponible", "size": horasDisponibles }
        ];
    }

    componentDidUpdate() {
        let chart = am4core.create("chart-diario", am4charts.PieChart);

        // Add data
        chart.data = this.procesarDataDiaria(this.props.data);
        
        // Add label
        chart.innerRadius = 100;
        let label = chart.seriesContainer.createChild(am4core.Label);
        label.text = this.props.fechaSeleccionada;
        label.horizontalCenter = "middle";
        label.verticalCenter = "middle";
        label.fontSize = 30;
        
        // Add and configure Series
        let pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "size";
        pieSeries.dataFields.category = "actividad";
  
        this.chart = chart;
    }

    componentWillUnmount() {
        if (this.chart) {
            this.chart.dispose();
        }
    }
    
    render() {
        return (
            <div className="chart-diario"></div>
        );
    }
    
}

class ChartSemanal extends Component {
    
    componentDidUpdate() {
        let chart = am4core.create("chart-semanal", am4charts.PieChart);

        // Add data
        chart.data = [
            { "actividad": "Vacaciones", "size": 9 },
            { "actividad": "Enfermedad", "size": 0 },
            { "actividad": "Día de estudio", "size": 0 },
            { "actividad": "Tarea", "size": 8 },
            { "actividad": "No ocupado", "size": 1 },
            { "actividad": "Disponible", "size": 1 }
        ];
        
        // Add label
        chart.innerRadius = 90;
        let label = chart.seriesContainer.createChild(am4core.Label);
        
        let fechaSeleccionada = this.props.fechaSeleccionada;
        // TODO mostrar inicio y fin semana
        console.log("Horas ", this.props.horasCargadas)

        label.text = fechaSeleccionada;
        label.horizontalCenter = "middle";
        label.verticalCenter = "middle";
        label.fontSize = 30;
        
        // Add and configure Series
        let pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "size";
        pieSeries.dataFields.category = "actividad";
  
        this.chart = chart;
    }
    
    componentWillUnmount() {
        if (this.chart) {
            this.chart.dispose();
        }
    }
    
    render() {
        return (
            <div className="chart-semanal"></div>
        );
    }
    
}

class ChartMensual extends Component {

    /*componentDidMount() {
        let chart = am4core.create("chart-mensual", am4charts.XYChart);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

        chart.data = [
            {
                category: "One",
                Vacaciones: 0,
                Enfermedad: 0,
                DíaDeEstudio: 9,
                Tarea: 29,
                NoOcupado: 2
            },
            {
                category: "Two",
                Vacaciones: 18,
                Enfermedad: 0,
                DíaDeEstudio: 0,
                Tarea: 2,
                NoOcupado: 2
            },
            {
                category: "Three",
                Vacaciones: 0,
                Enfermedad: 0,
                DíaDeEstudio: 0,
                Tarea: 40,
                NoOcupado: 0
            },
            {
                category: "Four",
                Vacaciones: 0,
                Enfermedad: 9,
                DíaDeEstudio: 0,
                Tarea: 30,
                NoOcupado: 1
            }
        ];

        chart.colors.step = 2;
        chart.padding(30, 30, 10, 30);
        chart.legend = new am4charts.Legend();

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.grid.template.location = 0;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        valueAxis.renderer.minWidth = 50;


        var series1 = chart.series.push(new am4charts.ColumnSeries());
        series1.columns.template.width = am4core.percent(80);
        series1.columns.template.tooltipText =
        "{name}: {valueY.totalPercent.formatNumber('#.00')}%";
        series1.name = "Vacaciones";
        series1.dataFields.categoryX = "category";
        series1.dataFields.valueY = "Vacaciones";
        series1.dataFields.valueYShow = "totalPercent";
        series1.dataItems.template.locations.categoryX = 0.5;
        series1.stacked = true;
        series1.tooltip.pointerOrientation = "vertical";

        var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
        bullet1.interactionsEnabled = false;
        bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet1.label.fill = am4core.color("#ffffff");
        bullet1.locationY = 0.5;

        var series2 = chart.series.push(new am4charts.ColumnSeries());
        series2.columns.template.width = am4core.percent(80);
        series2.columns.template.tooltipText =
        "{name}: {valueY.totalPercent.formatNumber('#.00')}%";
        series2.name = "Enfermedad";
        series2.dataFields.categoryX = "category";
        series2.dataFields.valueY = "Enfermedad";
        series2.dataFields.valueYShow = "totalPercent";
        series2.dataItems.template.locations.categoryX = 0.5;
        series2.stacked = true;
        series2.tooltip.pointerOrientation = "vertical";

        var bullet2 = series2.bullets.push(new am4charts.LabelBullet());
        bullet2.interactionsEnabled = false;
        bullet2.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet2.locationY = 0.5;
        bullet2.label.fill = am4core.color("#ffffff");

        var series3 = chart.series.push(new am4charts.ColumnSeries());
        series3.columns.template.width = am4core.percent(80);
        series3.columns.template.tooltipText =
        "{name}: {valueY.totalPercent.formatNumber('#.00')}%";
        series3.name = "Día de estudio";
        series3.dataFields.categoryX = "category";
        series3.dataFields.valueY = "DíaDeEstudio";
        series3.dataFields.valueYShow = "totalPercent";
        series3.dataItems.template.locations.categoryX = 0.5;
        series3.stacked = true;
        series3.tooltip.pointerOrientation = "vertical";

        var bullet3 = series3.bullets.push(new am4charts.LabelBullet());
        bullet3.interactionsEnabled = false;
        bullet3.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet3.locationY = 0.5;
        bullet3.label.fill = am4core.color("#ffffff");

        var series4 = chart.series.push(new am4charts.ColumnSeries());
        series4.columns.template.width = am4core.percent(80);
        series4.columns.template.tooltipText =
        "{name}: {valueY.totalPercent.formatNumber('#.00')}%";
        series4.name = "Tarea";
        series4.dataFields.categoryX = "category";
        series4.dataFields.valueY = "Tarea";
        series4.dataFields.valueYShow = "totalPercent";
        series4.dataItems.template.locations.categoryX = 0.5;
        series4.stacked = true;
        series4.tooltip.pointerOrientation = "vertical";

        var bullet4 = series4.bullets.push(new am4charts.LabelBullet());
        bullet4.interactionsEnabled = false;
        bullet4.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet4.locationY = 0.5;
        bullet4.label.fill = am4core.color("#ffffff");

        var series5 = chart.series.push(new am4charts.ColumnSeries());
        series5.columns.template.width = am4core.percent(80);
        series5.columns.template.tooltipText =
        "{name}: {valueY.totalPercent.formatNumber('#.00')}%";
        series5.name = "No Ocupado";
        series5.dataFields.categoryX = "category";
        series5.dataFields.valueY = "NoOcupado";
        series5.dataFields.valueYShow = "totalPercent";
        series5.dataItems.template.locations.categoryX = 0.5;
        series5.stacked = true;
        series5.tooltip.pointerOrientation = "vertical";

        var bullet5 = series5.bullets.push(new am4charts.LabelBullet());
        bullet5.interactionsEnabled = false;
        bullet5.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet5.locationY = 0.5;
        bullet5.label.fill = am4core.color("#ffffff");

        chart.scrollbarX = new am4core.Scrollbar();

        this.chart = chart;
    }*/

    componentDidMount() {
        let chart = am4core.create("chart-mensual", am4charts.XYChart);

        // Add data
        chart.data = [
            {
                category: "One",
                Vacaciones: 0,
                Enfermedad: 0,
                DíaDeEstudio: 9,
                Tarea: 29,
                NoOcupado: 2
            },
            {
                category: "Two",
                Vacaciones: 18,
                Enfermedad: 0,
                DíaDeEstudio: 0,
                Tarea: 2,
                NoOcupado: 2
            },
            {
                category: "Three",
                Vacaciones: 0,
                Enfermedad: 0,
                DíaDeEstudio: 0,
                Tarea: 40,
                NoOcupado: 0
            },
            {
                category: "Four",
                Vacaciones: 0,
                Enfermedad: 9,
                DíaDeEstudio: 0,
                Tarea: 30,
                NoOcupado: 1
            }
        ];
        
        chart.legend = new am4charts.Legend();
        chart.legend.position = "right";
        
        // Create axes
        var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.grid.template.opacity = 0;
        
        var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.renderer.grid.template.opacity = 0;
        valueAxis.renderer.ticks.template.strokeOpacity = 0.5;
        valueAxis.renderer.ticks.template.stroke = am4core.color("#495C43");
        valueAxis.renderer.ticks.template.length = 10;
        valueAxis.renderer.line.strokeOpacity = 0.5;
        valueAxis.renderer.baseGrid.disabled = true;
        valueAxis.renderer.minGridDistance = 40;
        
        // Create series
        function createSeries(field, name) {
            var series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueX = field;
            series.dataFields.categoryY = "category";
            series.stacked = true;
            series.name = name;
            
            var labelBullet = series.bullets.push(new am4charts.LabelBullet());
            labelBullet.locationX = 0.5;
            labelBullet.label.text = "{valueX}";
            labelBullet.label.fill = am4core.color("#fff");
        }
        
        createSeries("Vacaciones", "Vacaciones");
        createSeries("Enfermedad", "Enfermedad");
        createSeries("DiaDeEstudio", "Día de estudio");
        createSeries("Tarea", "Tarea");
        createSeries("NoOcupado", "No ocupado");

        this.chart = chart;
    }

    componentWillUnmount() {
        if (this.chart) {
            this.chart.dispose();
        }
    }
    
    render() {
        return (
            <div className="chart-mensual"></div>
        );
    }
    
}

class ChartAnual extends Component {

    componentDidMount() {
        let chart = am4core.create("chart-anual", am4charts.XYChart);

        // Add data
        chart.data = [{
            "mes": "Enero",
            "value": 600000
            }, {
            "mes": "Febrero",
            "value": 900000
            }, {
            "mes": "Marzo",
            "value": 180000
            }, {
            "mes": "Abril",
            "value": 600000
            }, {
            "mes": "Mayo",
            "value": 350000
            }, {
            "mes": "Junio",
            "value": 600000
            }, {
            "mes": "Julio",
            "value": 670000
            }, {
                "mes": "Agosto",
                "value": 600000
            }, {
                "mes": "Septiembre",
                "value": 350000
            }, {
                "mes": "Octubre",
                "value": 600000
            }, {
                "mes": "Noviembre",
                "value": 670000
            }, {
                "mes": "Diciembre",
                "value": 670000
            }
        ];

        // Populate data
        for (var i = 0; i < (chart.data.length - 1); i++) {
            chart.data[i].valueNext = chart.data[i + 1].value;
        }

        // Create axes
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "mes";
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.minGridDistance = 30;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;

        // Create series
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = "value";
        series.dataFields.categoryX = "mes";

        // Add series for showing variance arrows
        var series2 = chart.series.push(new am4charts.ColumnSeries());
        series2.dataFields.valueY = "valueNext";
        series2.dataFields.openValueY = "value";
        series2.dataFields.categoryX = "mes";
        series2.columns.template.width = 1;
        series2.fill = am4core.color("#555");
        series2.stroke = am4core.color("#555");

        // Add a triangle for arrow tip
        var arrow = series2.bullets.push(new am4core.Triangle);
        arrow.width = 10;
        arrow.height = 10;
        arrow.horizontalCenter = "middle";
        arrow.verticalCenter = "top";
        arrow.dy = -1;

        // Set up a rotation adapter which would rotate the triangle if its a negative change
        arrow.adapter.add("rotation", function(rotation, target) {
            return getVariancePercent(target.dataItem) < 0 ? 180 : rotation;
        });

        // Set up a rotation adapter which adjusts Y position
        arrow.adapter.add("dy", function(dy, target) {
            return getVariancePercent(target.dataItem) < 0 ? 1 : dy;
        });

        // Add a label
        var label = series2.bullets.push(new am4core.Label);
        label.padding(10, 10, 10, 10);
        label.text = "";
        label.fill = am4core.color("#0c0");
        label.strokeWidth = 0;
        label.horizontalCenter = "middle";
        label.verticalCenter = "bottom";
        label.fontWeight = "bolder";

        // Adapter for label text which calculates change in percent
        label.adapter.add("textOutput", function(text, target) {
        let percent = getVariancePercent(target.dataItem);
            return percent ? percent + "%" : text;
        });

        // Adapter which shifts the label if it's below the variance column
        label.adapter.add("verticalCenter", function(center, target) {
            return getVariancePercent(target.dataItem) < 0 ? "top" : center;
        });

        // Adapter which changes color of label to red
        label.adapter.add("fill", function(fill, target) {
            return getVariancePercent(target.dataItem) < 0 ? am4core.color("#c00") : fill;
        });

        function getVariancePercent(dataItem) {
            if (dataItem) {
                let value = dataItem.valueY;
                let openValue = dataItem.openValueY;
                let change = value - openValue;
                return Math.round(change / openValue * 100);
            }
            return 0;
        }

        this.chart = chart;
    }

    componentWillUnmount() {
        if (this.chart) {
            this.chart.dispose();
        }
    }
    
    render() {
        return (
            <div className="chart-anual"></div>
        );
    }

}