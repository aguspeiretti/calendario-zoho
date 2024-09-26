/* eslint-disable no-unused-vars */
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import "./select.css";

const Select = ({ data, event, handleGuardado, closePopup, setOwnerName }) => {
  const [estado, setEstado] = useState("");
  const [informe, setInforme] = useState("");
  const [conferencia, setConferencia] = useState("");
  const [fields, setFields] = useState([]);
  const [horaInicio, setHoraInicio] = useState("");
  const [minutosInicio, setMinutosInicio] = useState("");
  const [Final, setFinal] = useState("");
  const [minutosFin, setMinutosFin] = useState("");
  const [diaInicio, setDiaInicio] = useState("");
  const [diaFin, setDiaFin] = useState("");
  const [pProyecto, setPproyecto] = useState([]);
  const [tipo, setTipo] = useState("");
  const [motivo, setMotivo] = useState("");
  const [medio, setMedio] = useState("");
  const [animation, setAnimation] = useState(false);
  const [owner, setOwner] = useState("");
  const [formData, setFormData] = useState({
    id: event.id,
    Estado_Conferencia: "",
    Informe_auxiliar: "",
    Resumen_conferencia1: "",
    Start_DateTime: "",
    End_DateTime: "",
    Coord: "",
    Tipo_de_inconveniente: "",
    Motivo_sin_conferencia: "",
    Medio_de_contacto: "",
  });

  useEffect(() => {
    console.log("LLAMADO Host");

    window.ZOHO.CRM.API.getAllUsers({
      Type: "ActiveUsers",
      page: 1,
      per_page: 200,
    })
      .then(function (response) {
        const owner = event.owner.id;
        const ownerName = response.users.find((r) => r.id === owner);

        setOwnerName(ownerName);
      })
      .catch(function (error) {});
  }, []);

  const backgroundColors = {
    "por pautar": "#f8f65fb4 ",
    pautada: "#ffa3466c",
    realizada: "#5590ff7e",
    inconveniente: "#8de26b7e",
    "sin conferencia": "#8a8a8a6c",
    "consultada profesional": "#e789ff77",
    "consultada cliente": "#ff4d477a",
  };

  const traerFecha = dayjs(event.start).format("YYYY-MM-DD");
  const traerFechaFin = dayjs(event.end).format("YYYY-MM-DD");
  const traerHoraInicio = dayjs(event.start).format("HH");
  const traerMinInicio = dayjs(event.start).format("mm");
  const traerHoraFinal = dayjs(event.end).format("HH");
  const traerMinFinal = dayjs(event.end).format("mm");

  const isFirst = pProyecto.find((p) => p.name === "1er proyecto");

  // useEffect(() => {
  //   console.log(`${diaInicio}T${horaInicio}:${minutosInicio}:00`);
  //   console.log(`${diaFin}T${Final}:${minutosFin}:00`);
  // }, [diaInicio, diaFin, horaInicio, Final, minutosInicio, minutosFin]);

  useEffect(() => {
    if (event) {
      setEstado(event.estado);
      setConferencia(event.resumen);
      setInforme(event.informe);
      setDiaInicio(traerFecha);
      setDiaFin(traerFechaFin);
      setHoraInicio(traerHoraInicio);
      setMinutosInicio(traerMinInicio);
      setFinal(traerHoraFinal);
      setMinutosFin(traerMinFinal);
      setTipo(event.tipo_inconveniente);
      setMotivo(event.motivo);
      setMedio(event.medio);
      setOwner(event.owner.id);
    }

    getFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFormData({
      ...formData,
      Estado_Conferencia: estado,
      Resumen_conferencia1: conferencia,
      Informe_auxiliar: informe,
      Start_DateTime: `${diaInicio}T${horaInicio}:${minutosInicio}:00`,
      End_DateTime: `${diaFin}T${Final}:${minutosFin.padStart(2, "0")}:00`, // Asegúrate de que los minutosFin tengan dos dígitos
      Tipo_de_inconveniente: tipo,
      Motivo_sin_conferencia: motivo,
      Medio_de_contacto: medio,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    estado,
    conferencia,
    informe,
    Final,
    horaInicio,
    minutosInicio,
    minutosFin,
    diaInicio,
    diaFin,
    tipo,
    motivo,
    medio,
  ]);

  const config = {
    Entity: "Events",
    APIData: formData,
  };

  async function updateRecord(config) {
    console.log("LLAMADA DESDE EL UPDATE DE SELECT");

    try {
      const data = await window.ZOHO.CRM.API.updateRecord(config);

      return data;
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: `${error}`,
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
      });
      console.error(error);
      throw error; // Rechaza la promesa con el error para que pueda ser capturado externamente
    }
  }

  //funcion para guardar los cambios
  const guardarDatos = () => {
    if (medio === "" || medio === null) {
      Swal.fire({
        title: "Error",
        text: "Debes ingresar medio de contacto",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
        position: "center",
      });
      setAnimation(false);
      return;
    }

    if (estado === "Inconveniente" && (!tipo || tipo === "-None-")) {
      Swal.fire({
        title: "Error",
        text: "Debes ingresar el tipo de inconveniente",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
        position: "center",
      });
      setAnimation(false);
      return;
    }

    if (estado === "Sin conferencia" && (!motivo || motivo === "-None-")) {
      Swal.fire({
        title: "Error",
        text: "Debes ingresar el motivo sin conferencia",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
        position: "center",
      });
      setAnimation(false);
      return;
    }
    updateRecord(config)
      .then((resultado) => {
        // Actualiza el estado local con los nuevos datos
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...resultado.data, // Asegúrate de que la respuesta del servidor tenga los datos actualizados
        }));
        handleGuardado();
        closePopup();
        Swal.fire({
          title: "Éxito",
          text: "¡Los datos se actualizaron correctamente!",
          icon: "success",
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        Swal.fire({
          title: "Error",
          text: "Hubo un problema al actualizar los datos. Por favor, inténtalo de nuevo.",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
          position: "top-end",
        });
        console.error("Error al actualizar el registro:", error);
      });
  };

  // funcion para traer todos los campos del elemento

  const getFields = (entrity) => {
    console.log("LLAMADA DESDE EL GETFIELDS DE SELECT");
    return new Promise(function (resolve, reject) {
      window.ZOHO.CRM.META.getFields({ Entity: "Events" })
        .then(function (response) {
          setFields(response.fields);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  };

  // funcion para traer los campos desplegables y filtrarlos

  const getFieldValues = (fields, apiName) => {
    const field = fields.find((item) => item.api_name === apiName);
    return field ? field.pick_list_values || [] : [];
  };
  // muestra solo los campos desplegables
  const pickers = fields.filter((item) => item.data_type === "picklist");
  const est = getFieldValues(fields, "Estado_Conferencia");
  const conf = getFieldValues(fields, "Resumen_conferencia1");
  const medios = getFieldValues(fields, "Medio_de_contacto");
  const motivos = getFieldValues(fields, "Motivo_sin_conferencia");
  const tipos = getFieldValues(fields, "Tipo_de_inconveniente");

  const handleSubmit = (event) => {
    event.preventDefault();
    setAnimation(true);
    const startHour = parseInt(horaInicio, 10);
    const startMinutes = parseInt(minutosInicio, 10);
    const endHour = parseInt(Final, 10);
    const endMinutes = parseInt(minutosFin, 10);

    const startDate = dayjs(`${diaInicio} ${horaInicio}:${minutosInicio}:00`);
    const endDate = dayjs(`${diaFin} ${Final}:${minutosFin}:00`);

    if (endDate.isBefore(startDate)) {
      Swal.fire({
        title: "Error",
        text: "La FECHA de finalización no puede ser anterior a la fecha de inicio",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
        position: "center",
      });

      setAnimation(false);
      return;
    }

    if (
      endDate.isSame(startDate, "day") &&
      (endHour < startHour ||
        (endHour === startHour && endMinutes <= startMinutes))
    ) {
      Swal.fire({
        title: "Error",
        text: "La HORA de finalización no puede ser menor o igual que la hora de inicio",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
        position: "center",
      });
      setAnimation(false);
      return;
    }

    guardarDatos();
  };

  const handleChange = (event) => {
    const text = event.target.value;
    if (text.length <= 1900) {
      setInforme(text);
    }
  };

  const generarOpciones = () => {
    const opciones = [];
    for (let i = 0; i <= 23; i++) {
      const hora = i.toString().padStart(2, "0"); // Añadir cero inicial si es necesario
      opciones.push(
        <option key={hora} value={hora}>
          {hora}
        </option>
      );
    }
    return opciones;
  };
  const generarOpciones2 = () => {
    const opciones = [];
    for (let i = 0; i <= 50; i += 10) {
      const numero = i.toString().padStart(2, "0"); // Añadir cero inicial si es necesario
      opciones.push(
        <option key={numero} value={numero}>
          {numero}
        </option>
      );
    }
    return opciones;
  };

  return (
    <div className="h-full">
      <form className="h-[89%] flex flex-col justify-between  px-6 pt-8 ">
        <div className="flex w-full  justify-between items-center ">
          <label htmlFor="">Dia y Hora de inicio</label>
          <div className="w-[65%]  flex justify-end">
            <input
              className=""
              type="date"
              value={diaInicio}
              id="start"
              onChange={(e) => setDiaInicio(e.target.value)}
              placeholder="Ingrese el diaInicio"
            />
            <select
              className="ml-2 mr-2"
              id="seteoHoraInicio"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
            >
              {generarOpciones()}
            </select>
            <select
              id="seteominutosFinal"
              value={minutosInicio}
              onChange={(e) => setMinutosInicio(e.target.value)}
            >
              {generarOpciones2()}
            </select>
          </div>
        </div>
        <div className="flex w-full justify-between items-center">
          <label htmlFor="">Dia y Hora de fin</label>
          <div className="w-[65%]  flex justify-end">
            <input
              className=""
              type="date"
              value={diaFin}
              id="start"
              onChange={(e) => setDiaFin(e.target.value)}
              placeholder="Ingrese el diaInicio"
            />
            <select
              className="ml-2 mr-2"
              id="seteoHoraFin"
              value={Final}
              onChange={(e) => setFinal(e.target.value)}
            >
              {generarOpciones()}
            </select>
            <select
              id="seteoMinutosFin"
              value={minutosFin}
              onChange={(e) => setMinutosFin(e.target.value)}
            >
              {generarOpciones2()}
            </select>
          </div>
        </div>
        <div className="">
          <div className="3xl:mt-4 mt-2  flex items-center justify-between w-full">
            <label className="3xl:text-[16px] text-sm" htmlFor="coordinacion">
              Estado conferencia:
            </label>
            <select
              id="coordinacion"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              required
              className="3xl:w-[255px] w-[230px]"
            >
              {est.map((tipo, index) => (
                <option key={index} value={tipo.display_value}>
                  {tipo.display_value}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="">
          <div className="3xl:mt-4 mt-2  flex items-center justify-between w-full">
            <label className="3xl:text-[16px] text-sm" htmlFor="coordinacion">
              Motivo sin conferencia:
            </label>
            <select
              id="coordinacion"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
              className="3xl:w-[255px] w-[230px]"
            >
              {motivos.map((tipo, index) => (
                <option key={index} value={tipo.display_value}>
                  {tipo.display_value}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="">
          <div className="3xl:mt-4 mt-2  flex items-center justify-between w-full">
            <label className="3xl:text-[16px] text-sm" htmlFor="coordinacion">
              Tipo de inconveniente:
            </label>
            <select
              id="coordinacion"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              required
              className="3xl:w-[255px] w-[230px]"
            >
              {tipos.map((tipo, index) => (
                <option key={index} value={tipo.display_value}>
                  {tipo.display_value}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="">
          <div className="3xl:mt-4 mt-2  flex items-center justify-between w-full">
            <label className="3xl:text-[16px] text-sm" htmlFor="coordinacion">
              Medio de contacto:
            </label>
            <select
              id="coordinacion"
              value={medio}
              onChange={(e) => setMedio(e.target.value)}
              required
              className="3xl:w-[255px] w-[230px]"
            >
              {medios.map((tipo, index) => (
                <option key={index} value={tipo.display_value}>
                  {tipo.display_value}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className=" area ">
          <label className="" htmlFor="coordinacion">
            Informe auxiliar:
          </label>
          <textarea
            className="border-2 rounded-lg p-2 border-black h-[80px] 3xl:h-[130px]"
            id="story"
            name="story"
            value={informe}
            onChange={handleChange}
            rows="5"
            cols="30"
            placeholder="Redacte los cambios"
          ></textarea>
        </div>
      </form>
      <div className="h-[11%] flex justify-center items-center ">
        <button
          disabled={animation}
          className=" 3xl:bottom-8 border-[2px] h-[40px]   border-transparent px-4 py-1 3xl:px-8 3xl:py-2  rounded-lg text-black"
          style={{
            background: event ? ` ${backgroundColors[event.type]}` : " white",
          }}
          onClick={handleSubmit}
        >
          {animation ? <span class="loader"></span> : <p>Guardar Cambios</p>}
        </button>
      </div>
    </div>
  );
};

export default Select;
