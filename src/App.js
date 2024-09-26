/* eslint-disable react-hooks/exhaustive-deps */
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./App.css";
import dayjs from "dayjs";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "dayjs/locale/es";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import Select from "./components/Select";
import {
  faCalendarDays,
  faCircleDot,
  faClock,
} from "@fortawesome/free-regular-svg-icons";
import Swal from "sweetalert2";
import { backgroundColors } from "./components/externos";

function App(data) {
  dayjs.locale("es");
  const localizer = dayjsLocalizer(dayjs, {
    formats: {
      timeGutterFormat: "HH:mm", // Formato de la hora en la columna lateral
    },
    timeslots: 3, // Intervalos de 20 minutos (3 intervalos por hora)
  });
  const [profiles, setProfiles] = useState([]);
  const [values, setInputValues] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [startRender, setStartRender] = useState(true);
  const [tipoSelected, setTipoSelected] = useState(null);
  const [dpto, setDepto] = useState("");
  const [fields, setFields] = useState([]);
  const [fields2, setFields2] = useState([]);
  const [profesional, setProfesional] = useState("");
  const [cliente, setCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [telefonoAux, setTelefonoAux] = useState("");
  const [gestor, setGestor] = useState("");
  const [telAux, setTelAux] = useState("");
  const [coord, setCoord] = useState("");
  const [owner, setOwner] = useState("");
  const [ownerName, setOwnerName] = useState([]);
  const [isCoordinacion, setIsCoordinacion] = useState([]);
  const [host, setHost] = useState("");
  const [pProyecto, setPproyecto] = useState([]);
  const [id, setId] = useState("");
  const isFirst = pProyecto.find((p) => p.name === "1er proyecto");
  const getFieldValues = (fields, apiName) => {
    const field = fields.find((item) => item.api_name === apiName);
    return field ? field.pick_list_values || [] : [];
  };
  const [isDepartmentEnabled, setIsDepartmentEnabled] = useState(false);
  //trae los values de departamento
  const departamento = getFieldValues(fields, "Coord");
  const tipoFieldss = getFieldValues(fields2, "Tipo_de_conferencia");
  const [msjNumero, setMsjNumero] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [cartel, setCartel] = useState(false);

  console.log(values);

  // useEffect(() => {
  //   console.log(guardado);
  // }, [guardado]);

  useEffect(() => {
    revelar();
    // Verifica si al menos una de las dos condiciones es verdadera
    if (
      selectedProfile !== "vacio" ||
      (tipoSelected !== null && tipoSelected !== "Seleccione un tipo")
    ) {
      setIsDepartmentEnabled(true);
    } else {
      setIsDepartmentEnabled(false);
    }
  }, [selectedProfile, tipoSelected]);

  useEffect(() => {
    console.log("LLAMADA resize");
    window.ZOHO.CRM.UI.Resize({ height: "100%", width: "100%" });

    const getFields = async (entity, setFields) => {
      try {
        const response = await window.ZOHO.CRM.META.getFields({
          Entity: entity,
        });

        setFields(response.fields);
      } catch (error) {
        console.error(`Error fetching fields for ${entity}`, error);
      }
    };

    getFields("Coordinacion", setFields);
    getFields("Events", setFields2);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [selectedEvent]);

  //trae el usuario conectado
  useEffect(() => {
    console.log("LLAMADO CURRENTALLUSERS");
    window.ZOHO.CRM.CONFIG.getCurrentUser().then(function (data) {
      const currentUserInProfiles = profiles.some(
        (profile) => profile.id === data.users[0].id
      );

      if (currentUserInProfiles) {
        // Establecer el perfil seleccionado
        setSelectedProfile(data.users[0].id);
      } else {
        setSelectedProfile("vacio");
        setHost(data.users[0].full_name);
      }
    });
  }, [isCoordinacion]);

  useEffect(() => {
    console.log("LLAMADO CURRENTALLUSERS");
    window.ZOHO.CRM.CONFIG.getCurrentUser().then(function (data) {
      const perfil = profiles.find(
        (profile) => profile.id === data.users[0].id
      );
      setIsCoordinacion(perfil.profile.name);
    });
  }, [profiles, isCoordinacion]);

  useEffect(() => {
    console.log("LLAMADO GETALLUSERS");
    window.ZOHO.CRM.API.getAllUsers({ Type: "ActiveUsers" }).then(function (
      data
    ) {
      // Filtras los perfiles por cada ID y luego concatenas los resultados en un solo array
      const profiles = [
        data.users.filter(
          (profile) => profile.profile.id === "282759000126792952"
        ),
        data.users.filter(
          (profile) => profile.profile.id === "282759000127703436"
        ),
        data.users.filter(
          (profile) => profile.profile.id === "282759000126792886"
        ),
        data.users.filter(
          (profile) => profile.profile.id === "282759000127855773"
        ),
        data.users.filter(
          (profile) => profile.profile.id === "282759000131740400"
        ),
        data.users.filter(
          (profile) => profile.profile.id === "282759000132804397"
        ),
      ].reduce(
        (accumulator, currentValue) => accumulator.concat(currentValue),
        []
      );

      setProfiles(profiles);
    });
  }, []);
  // trae el usuario que esta conectado //
  // trae los profiles para el option //
  useEffect(() => {
    //funcion con el query para traer los eventos
    const fetchEvents = async (offset = 0, limit = 200) => {
      let allEvents = [];
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const firstDayOfMonth =
        new Date(currentYear, currentMonth - 1, 1).toISOString().slice(0, 10) +
        "T00:00:00+00:00";
      const lastDayOfMonth =
        new Date(currentYear, currentMonth, 0).toISOString().slice(0, 10) +
        "T23:59:59+00:00";

      if (startRender) {
        setStart(firstDayOfMonth);
        setEnd(lastDayOfMonth);
      } else {
        setStart(start);
        setEnd(end);
      }

      const config = {
        select_query: `select  What_Id,Tipo_de_inconveniente,Medio_de_contacto,Motivo_sin_conferencia,Estado_Conferencia,Informe_auxiliar,Tipo_de_conferencia,Resumen_conferencia1, Event_Title, Start_DateTime, End_DateTime, Owner from Events WHERE Owner='${selectedProfile}' and Start_DateTime between '${start}' and '${end}' LIMIT ${limit} OFFSET ${offset}`,
      };
      const config2 = {
        select_query: `select  What_Id,Tipo_de_inconveniente,Medio_de_contacto,Motivo_sin_conferencia,Estado_Conferencia,Informe_auxiliar,Tipo_de_conferencia,Resumen_conferencia1, Event_Title, Start_DateTime, End_DateTime, Owner from Events WHERE Tipo_de_conferencia='${tipoSelected}' and Start_DateTime between '${start}' and '${end}' LIMIT ${limit} OFFSET ${offset}`,
      };

      try {
        if (config) {
          const response =
            selectedProfile !== "vacio"
              ? await window.ZOHO.CRM.API.coql(config)
              : "";
          const response2 = tipoSelected
            ? await window.ZOHO.CRM.API.coql(config2)
            : [];

          let newRecord;

          if (
            selectedProfile !== "vacio" &&
            (!tipoSelected || tipoSelected === "")
          ) {
            newRecord = response;
          } else if (
            selectedProfile === "vacio" &&
            tipoSelected &&
            tipoSelected !== null
          ) {
            newRecord = response2;
          } else {
            const owner = response.data[0].Owner.id;
            const filtrado = response2.data.filter((r) => r.Owner.id === owner);
            const refiltred = { ...response2, data: filtrado };
            newRecord = refiltred;
          }

          if (dpto.length !== 0) {
            const dptoMapping = {
              Expertos: "- E",
              Entregas: "- G",
              CCSS: "- CS",
              Gestión: "- J",
              Profesionales: "- P",
              Formadores: "- F",
            };
            const searchString = dptoMapping[dpto] || "";
            const filteredEvents = newRecord.data.filter((event) =>
              event.Event_Title.includes(searchString)
            );
            const final = { ...newRecord, data: filteredEvents };
            newRecord = final;
          }

          const eventsWithExtraTime = newRecord.data.map((event) => ({
            ...event,

            Start_DateTime: event.Start_DateTime,
            End_DateTime: event.End_DateTime,
          }));

          allEvents = eventsWithExtraTime;

          console.log(allEvents);
          if (newRecord.info.more_records) {
            // Hay más registros, así que hacemos una nueva llamada recursiva
            const additionalEvents = await fetchEvents(offset + limit, limit);
            allEvents = allEvents.concat(additionalEvents);
          }
          console.log(allEvents);

          return allEvents;
        }
      } catch (error) {
        console.error("Error fetching events from Zoho CRM:", error);
        return []; // O manejar el error de acuerdo a tus necesidades
      }
    };

    fetchEvents().then((events) => {
      setInputValues(events);
    });
    console.log("LLAMADO FETCHEVENTSS");
    setStartRender(false);
  }, [selectedProfile, tipoSelected, dpto, start, end, guardado]);
  //funcion para abrir el popup
  const openPopup = (event) => {
    setSelectedEvent(event);
    setPopupOpen(true);
  };
  //funcion para cerrar el popup
  const closePopup = () => {
    setPopupOpen(false);
  };
  //funcion para abrir el evento seleccionado en pantalla nueva
  const handleEventClick = () => {
    if (selectedEvent) {
      const eventId = selectedEvent.id; // Suponiendo que tengas la propiedad 'id' en el objeto selectedEvent
      const url = `https://crm.zoho.eu/crm/org20070470145/tab/Events/${eventId}`;
      window.open(url, "_blank");
    }
  };
  const handleEventClickCoordinacion = () => {
    if (selectedEvent) {
      const coordId = selectedEvent.coord_Id; // Suponiendo que tengas la propiedad 'id' en el objeto selectedEvent
      const url = `https://crm.zoho.eu/crm/org20070470145/tab/CustomModule30/${coordId}/`;
      window.open(url, "_blank");
    }
  };
  //funcion para Actualizar el usuario con el perfil seleccionado
  const handleProfileChange = (event) => {
    setSelectedProfile(event.target.value);
    setInputValues(null);
  };
  const handleTipoChange = (event) => {
    const selectedValue = event.target.value === "" ? null : event.target.value;
    setTipoSelected(selectedValue);
    setInputValues(null); // Mantén esta línea si es necesaria en tu lógica
  };
  const handleDepartamentoChange = (event) => {
    setDepto(event.target.value);

    setInputValues(null);
  };
  // funcion para elegir la info que muestra el onMouse
  const customTooltipAccessor = (event) => {
    return `${event.title} `; // Ejemplo de tooltip personalizado mostrando el tipo de evento
  };
  //cambia la info a español
  const messages = {
    allDay: "Todo el día",
    previous: "Anterior",
    next: "Siguiente",
    work_week: "Semana",
    today: "Hoy",
    month: "Mes",
    week: "Semana",
    day: "Día",
    agenda: "Agenda",
    date: "Fecha",
    time: "Hora",
    event: "Evento",
    noEventsInRange: "Sin eventos",
  };
  //Aca se setean los valores que vienen en el query
  function getLocalTimeZoneOffset() {
    const offset = new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset > 0 ? "-" : "+";
    return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  }

  // Obtén la diferencia horaria local
  const localTimeZoneOffset = getLocalTimeZoneOffset();

  // Función para ajustar la fecha con la zona horaria local
  function adjustTimeZone(dateString, localOffset) {
    return new Date(
      dateString.toString().replace(/([+-]\d{2}:\d{2})/, localOffset)
    );
  }

  // Procesa los eventos con la diferencia horaria local aplicada
  const events = values
    ? values.map((value) => {
        return {
          start: adjustTimeZone(value.Start_DateTime, localTimeZoneOffset),
          end: adjustTimeZone(value.End_DateTime, localTimeZoneOffset),
          title: value.Event_Title,
          type: value.Estado_Conferencia.toLowerCase(),
          id: value.id,
          estado: value.Estado_Conferencia,
          informe: value.Informe_auxiliar,
          resumen: value.Resumen_conferencia1,
          coord_Id: value.What_Id.id,
          tipo: value.Tipo_de_conferencia,
          tipo_inconveniente: value.Tipo_de_inconveniente,
          motivo: value.Motivo_sin_conferencia,
          medio: value.Medio_de_contacto,
          owner: value.Owner,
        };
      })
    : [];
  console.log("EVENTES", events);

  // este es el componente q se muestra , la estetica del evento
  const components = {
    event: (props) => {
      const { type } = props.event;
      let eventoClase = "evento";

      const colors = {
        "por pautar": "#F8F65F",
        pautada: "#FFA246",
        realizada: "#5590FF",
        inconveniente: "#8de26b",
        "sin conferencia": "#8a8a8a",
        "consultada profesional": "#E789FF",
        "consultada cliente": "#FF4E47",
      };

      const color = colors[type] || "black";

      // Manejador de clic para abrir el popup y mostrar información del evento
      const handleClick = () => {
        openPopup(props.event);
      };

      switch (type) {
        case "por pautar":
          eventoClase += " por-pautar";
          break;
        case "pautada":
          eventoClase += " pautada";
          break;
        case "realizada":
          eventoClase += " realizada";
          break;
        case "inconveniente":
          eventoClase += " inconveniente";
          break;
        case "sin conferencia":
          eventoClase += " sin-conferencia";
          break;
        case "consultada profesional":
          eventoClase += " consultada-profesional";
          break;
        case "consultada cliente":
          eventoClase += " consultada-cliente";
          break;
        default:
          break;
      }

      return (
        <>
          <div className={eventoClase} onClick={handleClick}>
            <ul>
              <FontAwesomeIcon icon={faCircleDot} style={{ color }} />
              <li>{props.title}</li>
            </ul>
            {/* <p>Inicio: {dayjs(props.start).format("HH:mm")}</p> */}
          </div>
        </>
      );
    },
  };

  //este es el popUp , la estetica del popUp
  const fetchEvents = () => {
    if (!selectedEvent || !selectedEvent.coord_Id) {
      return; // Si selectedEvent no tiene valor o coord_Id no está definido, no hacer nada
    }
    window.ZOHO.CRM.API.getRecord({
      Entity: "Coordinacion",
      approved: "both",
      RecordID: selectedEvent.coord_Id,
    }).then(function (data) {
      setProfesional(data.data[0].Profesional_Asignado.name);
      setCliente(data.data[0].Nombre_cliente);
      setTelefono(data.data[0].Telefono);
      setTelefonoAux(data.data[0].Telefono_aux);
      setPproyecto(data.data[0].Tag);
      setGestor(data.data[0].Gestor_a);
      setId(data.data[0].id);
      setCoord(data.data[0].Coord);
    });
    console.log("LLAMADO getRECORDS");
  };

  async function updateRecord() {
    console.log("LLAMADO UPDATE");
    const config = {
      Entity: "Coordinacion",
      APIData: {
        id: selectedEvent.coord_Id,
        Telefono_aux: telefonoAux.toString(),
      },
    };
    try {
      const data = await window.ZOHO.CRM.API.updateRecord(config);
      console.log(data);
      Swal.fire({
        title: "Éxito",
        text: "¡Los datos se actualizaron correctamente!",
        icon: "success",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });
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
  const updateTel = () => {
    updateRecord().then(function (data) {});
  };
  const handleChange = (e) => {
    const inputValue = e.target.value;
    const validInput = /^[0-9+]*$/;

    if (validInput.test(inputValue)) {
      setTelefonoAux(inputValue);
      setMsjNumero(false);
    } else {
      setMsjNumero(true);

      setTimeout(() => {
        setMsjNumero(false);
      }, 2000);
    }
    e.preventDefault();
  };

  const handleGuardado = () => {
    setGuardado(!guardado);
    revelar();
  };

  const popup = (
    <div className="backgrop">
      <div className="popup w-[70%] h-[90%] 3xl:w-[60%] 3xl:h-[85%]">
        <div
          className="popup-content  w-[98%] h-[99%] border-8 rounded-lg"
          style={{
            border: selectedEvent
              ? `8px solid ${backgroundColors[selectedEvent.type]}`
              : "8px solid white",
          }}
        >
          {selectedEvent && (
            <div className="flex w-full h-full rounded-md ">
              <div
                className="w-[50%] h-full px-6 "
                style={{
                  background: selectedEvent
                    ? ` ${backgroundColors[selectedEvent.type]}`
                    : "8px solid white",
                }}
              >
                <div className=" h-[15%] flex flex-col justify-between">
                  <h2 className=" text-xl font-bold">{selectedEvent.title}</h2>
                  <div className="">
                    <div className="">
                      <p className="font-semibold ">
                        <FontAwesomeIcon
                          className="mr-4 "
                          icon={faCalendarDays}
                          style={{ color: "#000" }}
                        />
                        {dayjs(selectedEvent.start).format("DD / MM / YYYY")}
                      </p>
                      <p className="font-semibold">
                        <FontAwesomeIcon
                          className="mr-4"
                          icon={faClock}
                          style={{ color: "#000" }}
                        />
                        {dayjs(selectedEvent.start).format("HH:mm")} -{" "}
                        {dayjs(selectedEvent.end).format("HH:mm")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="3xl:text-lg  h-[75%] text-md flex flex-col justify-between py-6">
                  <div className="flex  3xl:text-lg">
                    <p>D.Gestor:</p>
                    <p className="prof">
                      <strong>{gestor}</strong>
                    </p>
                  </div>
                  <div className="flex  3xl:text-lg">
                    <p>D.Coordinacion:</p>
                    <p className="prof">
                      <strong>{coord}</strong>
                    </p>
                  </div>
                  <div className="flex  3xl:text-lg">
                    <p>Host:</p>
                    <p className="prof">
                      <span className="prof">
                        {ownerName ? ownerName.full_name : null}
                      </span>
                    </p>
                  </div>
                  <div className="flex  3xl:text-lg ">
                    <p>Primer proyecto:</p>
                    <p className="prof">
                      {isFirst && isFirst.length !== 0 ? "Si" : "No"}
                    </p>
                  </div>
                  <div className="flex  3xl:text-lg">
                    <p>Profesional:</p>
                    <p className="prof">{profesional}</p>
                  </div>
                  {isCoordinacion !== "Equipo coordinacion" ? (
                    <>
                      <div className="flex  3xl:text-lg ">
                        <p>Cliente:</p>
                        <p className="prof">{cliente}</p>
                      </div>
                      <div className="flex  3xl:text-lg ">
                        <p>Telefono Cliente (ventas):</p>
                        <p className="prof">{telefono}</p>
                      </div>

                      <div className="flex items-center  3xl:text-lg ">
                        <p>Telefono Cliente (aux):</p>
                        <div className="ml-4 relative">
                          <input
                            value={telefonoAux}
                            onChange={handleChange}
                            onInput={(e) => {
                              const inputValue = e.target.value;
                              const validInput = /^[0-9+]*$/;
                              if (!validInput.test(inputValue)) {
                                e.target.value = telefonoAux; // Revertir al último valor válido
                              }
                            }}
                            required
                            className="w-[200px] h-[26px] bg-white rounded-md pl-4"
                            pattern="[0-9+]*"
                            type="tel"
                          />
                          {msjNumero ? (
                            <p className="absolute top-8 left-6 font-bold text-red-600">
                              solo números o "+"
                            </p>
                          ) : null}
                        </div>

                        <button
                          className="border-2 border-black text-sm px-1 ml-4 mt-1 h-[26px] rounded-md"
                          onClick={() => {
                            updateTel();
                          }}
                        >
                          Guardar
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
                <div className="flex items-center  gap-6 h-[10%] justify-center">
                  <button
                    className=" 3xl:bottom-8 border-[2px] h-[40px]   border-black px-4 py-1 3xl:px-8 3xl:py-2  rounded-lg text-black"
                    onClick={handleEventClick}
                  >
                    Ver evento
                  </button>
                  <button
                    className=" 3xl:bottom-8 border-[2px] h-[40px]   border-black px-4 py-1 3xl:px-4 3xl:py-2  rounded-lg text-black"
                    onClick={handleEventClickCoordinacion}
                  >
                    Ver coordinacion
                  </button>
                </div>
              </div>
              <div className="w-[50%] h-full bg-[#fff]  ">
                <div className="w-full h-[8%] flex justify-between items-center px-2  ">
                  <p className="text-lg pl-6 font-semibold">
                    Modificar conferencia
                  </p>
                  <button
                    className="w-[30px] h-[30px] rounded-md text-black font-semibold"
                    onClick={closePopup}
                    style={{
                      background: selectedEvent
                        ? ` ${backgroundColors[selectedEvent.type]}`
                        : "8px solid white",
                    }}
                  >
                    X
                  </button>
                </div>
                <div className="b h-[92%]">
                  <div className="h-full">
                    <Select
                      handleGuardado={handleGuardado}
                      data={values}
                      event={selectedEvent}
                      backgroundColors={backgroundColors}
                      closePopup={closePopup}
                      setOwnerName={setOwnerName}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  //funcion para mostrar el horario en la columna izquierda
  const CustomTimeSlot = ({ value }) => {
    const hours = dayjs(value).hour();
    const minutes = dayjs(value).minute();

    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    return <div className="custom-time-slot">{formattedTime}</div>;
  };
  //funcion para navegar por el calendario
  const handleNavigate = (date) => {
    const firstDayOfMonth = dayjs(date).startOf("month").toDate();
    const lastDayOfMonth = dayjs(date).endOf("month").toDate();

    // Formatear las fechas en el formato deseado
    const formattedFirstDayOfMonth =
      firstDayOfMonth.toISOString().slice(0, 10) + "T00:00:00+00:00";
    const formattedLastDayOfMonth =
      lastDayOfMonth.toISOString().slice(0, 10) + "T23:59:59+00:00";

    setStart(formattedFirstDayOfMonth);
    setEnd(formattedLastDayOfMonth);
  };

  const revelar = () => {
    setCartel(true);
    setTimeout(() => {
      setCartel(false);
    }, 6500);
  };

  return (
    <>
      {cartel ? (
        <div className="bg-blue-600 text-white text-center">
          Actualizando informacion...
          <span class="loader"></span>
        </div>
      ) : null}
      <div className="container">
        <div className="filtros relative">
          <div className="selector2">
            <h3>Seleccion usuario</h3>
            <select
              name="profiles"
              id="profiles"
              value={selectedProfile}
              onChange={handleProfileChange}
            >
              <option value="vacio">Seleccione un perfil</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="selector2">
            <h3>Seleccione un tipo</h3>
            <select
              name="tipos"
              id="tipos"
              value={tipoSelected}
              onChange={handleTipoChange}
            >
              <option value="">Seleccione un tipo</option>
              {tipoFieldss
                .filter((p) => p.actual_value !== "-None-") // Filtra la opción "-None-"
                .map((p) => (
                  <option key={p.id} value={p.actual_value}>
                    {p.actual_value}
                  </option>
                ))}
            </select>
          </div>
          <div className="selector2">
            <h3 className={`${isDepartmentEnabled ? "activo" : "inactivo"}`}>
              Departamento
            </h3>
            <select
              name="departamento"
              id="departamento"
              value={dpto}
              disabled={!isDepartmentEnabled}
              onChange={handleDepartamentoChange}
            >
              <option value="">Seleccione un departamento</option>
              {departamento.map((p) => (
                <option key={p.id} value={p.actual_value}>
                  {p.actual_value}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="calendar-size">
          <Calendar
            views={["month", "work_week", "day"]}
            localizer={localizer}
            messages={messages}
            events={events}
            step={10}
            dayStart={"05:00"}
            dayEnd={"23:59"}
            timeslots={6}
            showMultiDayTimes={true}
            dayLayoutAlgorithm={"no-overlap"}
            components={{
              timeSlotWrapper: CustomTimeSlot,
              ...components,
            }}
            tooltipAccessor={customTooltipAccessor}
            onNavigate={handleNavigate}
          />
        </div>
        {popupOpen && popup}
      </div>
    </>
  );
}

export default App;
