var URL_SOAP = "http://localhost/~sebastian/wsdl/index.php?wsdl";
var URL_RESTFUL = "http://localhost/~sebastian/wsdl/restfull.php";

function cambiarColor(component) {
    component.style.color = "#ADBCFF";
}
function cambiarColorInput(component) {
    var color = component.value;
    var txts = document.getElementsByTagName("input");
    for (var i = 0; i < txts.length; i++) {
        if (txts[i].type == 'text')
            txts[i].style.color = color;
    }
}

function calcularEdad(fecha) {
    //var fecha = document.getElementById("fecha");
    var hoy = new Date();
    var cumpleanos = new Date(fecha);
    var edad = hoy.getFullYear() - cumpleanos.getFullYear();
    var m = hoy.getMonth() - cumpleanos.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
    }
    if(edad > 0)
        edad = 0;    
    return edad;
}

function cargarEspecialidades() {
    //var URL = "http://localhost/~sebastian/wsdl/index.php?wsdl";
    var peticion = '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">';
    peticion += '<Body>';
    peticion += '<lista_especialidades xmlns="urn:server"/>';
    peticion += '</Body>';
    peticion += '</Envelope>';
    $.ajax({
        url: URL_SOAP,
        data: peticion,
        type: 'POST',
        dataType: 'xml',
        contentType: 'text/xml',
        success: function (data, textStatus, jqXHR) {
            console.log(textStatus + " " + jqXHR.status);
            var xml = jqXHR.responseXML;
            var xmlChange = $.parseXML(xml);
            var option = '';
            $(xml).text(xmlChange).find("item").each(function () {
                var id = $(this).find("id").text();
                var nombre = $(this).find("nombre").text();
                option += '<option value="' + nombre + '">' + nombre + '</option>';
            });
            $("#especialidad").html(option);
        },
        error: function (jqXHR, textStatus, errorThrown) {

        }
    });

}

function validarCedula(cedula) {
    var cad = cedula.trim();
    var total = 0;
    var longitud = cad.length;
    var longcheck = longitud - 1;

    if (cad !== "" && longitud === 10) {
        for (i = 0; i < longcheck; i++) {
            if (i % 2 === 0) {
                var aux = cad.charAt(i) * 2;
                if (aux > 9)
                    aux -= 9;
                total += aux;
            } else {
                total += parseInt(cad.charAt(i)); // parseInt o concatenará en lugar de sumar
            }
        }

        total = total % 10 ? 10 - total % 10 : 0;

        if (cad.charAt(longitud - 1) == total) {
            return true;
        } else {
            return false;
        }
    }
}

function manejoErrores(xml) {
    var xmlData = $.parseXML(xml);
    var error = $(xml).find("faultstring").text();
    //console.log(error);
    var mensaje = '<div class="alert alert-danger">';
    mensaje += error;
    mensaje += '</div>';

    $("#error").html(mensaje);
}

function verificarInicioSesion() {
    if (localStorage["token"] != null) {
        location.href = "principal.html";
    }
}

function verificarNoInicioSesion() {
    if (localStorage["token"] == null) {
        location.href = "login.html";
    }
}

function cerrar_sesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("external");
    location.href = "login.html";
}

function cargarDatosPaciente(data) {            
   var datos = JSON.parse('{"' + data.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value) });
    console.log(datos);
    $("#apellidos").val(datos.apellidos);
    $("#nombres").val(datos.nombres);
    $("#fecha").val(datos.fecha_nac);
    $("#dir").val(datos.direccion);
    $("#genero").val(datos.genero);
    var edadAux = calcularEdad($("#fecha").val());
    $("#edad").val(edadAux);
    $("#celular").val(datos.celular);
    $("#habitos").val(datos.telefono);
    $("#enf").val(datos.enfermedades);
    $("#enf_h").val(datos.enferm_heder);
    $("#cedula").val(datos.cedula);
    $("#fono").val(datos.telefono);
    $("#external").val(datos.external);
}

function cargarPacientes() {
    var accion = "/listar_paciente";    
    $.ajax({
        url: URL_RESTFUL+accion,
        type: 'GET',
        dataType: 'json',
        headers: {'api-token': localStorage["token"]},        
        success: function (data, textStatus, jqXHR) {
            
            if (data.codigo) {
                manejoErroresJson(data.message, data.codigo);
            } else {
                var tabla = '';
                
                $.each(data, function (index, item) {                    
                    var itemData = $.param(item);                    
                    console.log(itemData);
                    tabla += '<tr>';
                    tabla += '<td>' + (index + 1) + '</td>';
                    tabla += '<td>' + item.cedula + '</td>';
                    tabla += '<td>' + item.apellidos + ' ' + item.nombres + '</td>';
                    tabla += '<td><a id="'+index+'" href="#" data-toggle="modal" data-target="#exampleModalScrollable" class="btn btn-primary" onclick="cargarDatosPaciente('+"'"+itemData+"'"+')">Modificar</a></td>';
                    
                    tabla += '</tr>';
                });
                $("#tabla tbody").html(tabla);
            }

        }, error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
        }
    });
}

function manejoErroresJson(error, codigo) {
    if(codigo == "401") {
        error = "Hubo un error al momento de solicaitar la informacion, por favor pongase en contacto con el administrador del sistema";
    }
    //console.log(error);
    var mensaje = '<div class="alert alert-danger">';
    mensaje += error;
    mensaje += '</div>';

    $("#error").html(mensaje);
}