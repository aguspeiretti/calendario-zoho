import "react-big-calendar/lib/css/react-big-calendar.css";
import "./App.css";
import dayjs from "dayjs";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "dayjs/locale/es";
import { useState } from "react";
import {
  faCalendarDays,
  faCircleDot,
  faClock,
} from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";

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
  const [selectedProfile, setSelectedProfile] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [startRender, setStartRender] = useState(true);

  console.log("selected",selectedProfile);

  useEffect(() => {
    // trae el usuario que esta conectado //
    window.ZOHO.CRM.CONFIG.getCurrentUser().then(function (data) {
      console.log("currentData", data.users[0].id);
      if(selectedProfile === ""){
        setSelectedProfile(data.users[0].id)
      }
    });

    // trae los profiles para el option //

    window.ZOHO.CRM.API.getAllUsers({ Type: "ActiveUsers" }).then(function (
      data
    ) {
      console.log("allusers", data);

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

      console.log("profiles", profiles);
      setProfiles(profiles);
    });

    // trae las conferencias dependiendo la fecha
    // const fetchEvents = () => {
    //   const currentDate = new Date();
    //   const currentYear = currentDate.getFullYear();
    //   const currentMonth = currentDate.getMonth() + 1;
    //   const firstDayOfMonth =
    //     new Date(currentYear, currentMonth - 1, 1).toISOString().slice(0, 10) +
    //     "T00:00:00+00:00";
    //   const lastDayOfMonth =
    //     new Date(currentYear, currentMonth, 0).toISOString().slice(0, 10) +
    //     "T23:59:59+00:00";

    //   var config = {
    //     select_query: `select Estado_Conferencia, Event_Title, Start_DateTime, End_DateTime, Owner from Events WHERE   Owner='${selectedProfile}' and Start_DateTime between '${firstDayOfMonth}' and '${lastDayOfMonth}' `,
    //   };

    //   window.ZOHO.CRM.API.coql(config)
    //     .then(function (response) {
    //       console.log(response);
    //       console.log("Response from Zoho CRM API:", response.data); // Aquí se imprime la respuesta en la consola
    //       setInputValues(response.data.length === 0 ? [] : response.data);
    //     })
    //     .catch(function (error) {
    //       console.error("Error fetching events from Zoho CRM:", error); // Manejo de errores
    //     });
    // };

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
        select_query: `select Estado_Conferencia, Event_Title, Start_DateTime, End_DateTime, Owner from Events WHERE Owner='${selectedProfile}' and Start_DateTime between '${start}' and '${end}' LIMIT ${limit} OFFSET ${offset}`,
      };
    
      try {
        const response = await window.ZOHO.CRM.API.coql(config);
        console.log("Response from Zoho CRM API:", response.data);
    
        const eventsWithExtraTime = response.data.map((event) => ({
          ...event,
          Start_DateTime: dayjs(event.Start_DateTime).add(5, "hour").toDate(),
          End_DateTime: dayjs(event.End_DateTime).add(5, "hour").toDate(),
        }));
    
        allEvents = eventsWithExtraTime;
    
        if (response.info.more_records) {
          // Hay más registros, así que hacemos una nueva llamada recursiva
          const additionalEvents = await fetchEvents(offset + limit, limit);
          allEvents = allEvents.concat(additionalEvents);
        }
    
        return allEvents;
      } catch (error) {
        console.error("Error fetching events from Zoho CRM:", error);
        return []; // O manejar el error de acuerdo a tus necesidades
      }
    };
    
    fetchEvents().then((events) => {
      setInputValues(events);
    });
    

    setStartRender(false);
  }, [selectedProfile, start, end]);

  const openPopup = (event) => {
    setSelectedEvent(event);
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
  };

  const handleEventClick = () => {
    if (selectedEvent) {
      const eventId = selectedEvent.id; // Suponiendo que tengas la propiedad 'id' en el objeto selectedEvent
      const url = `https://crm.zoho.eu/crm/org20070470145/tab/Events/${eventId}`;
      window.open(url, "_blank");
    }
  };

  const handleProfileChange = (event) => {
    setSelectedProfile(event.target.value); // Actualizar el estado con el perfil seleccionado
    setInputValues(null);
  };

  // info que muestra el onMouse
  const customTooltipAccessor = (event) => {
    // const formattedStart = dayjs(event.start).format("HH:mm");
    // const formattedEnd = dayjs(event.end).format("HH:mm");
    // Aquí  puedes personalizar el tooltip según tu lógica
    return `   ${event.title} `; // Ejemplo de tooltip personalizado mostrando el tipo de evento
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

  const events = values
    ? values.map((value, index) => {
        // console.log("este es el value" ,value);
        return {
          start: new Date(value.Start_DateTime),
          end: new Date(value.End_DateTime),
          title: value.Event_Title,
          type: value.Estado_Conferencia.toLowerCase(),
          id: value.id,
        };
      })
    : [];

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

  // Definir el objeto de colores de fondo según el tipo de evento
  const backgroundColors = {
    "por pautar": "#f8f65fb4 ",
    pautada: "#ffa3466c",
    realizada: "#5590ff7e",
    inconveniente: "#8de26b7e",
    "sin conferencia": "#8a8a8a6c",
    "consultada profesional": "#e789ff77",
    "consultada cliente": "#ff4d477a",
  };

  const popup = (
    <div className="popup">
      <div
        className="popup-content "
        style={{
          width: "90%",
          height: "85%",
          backgroundColor: selectedEvent
            ? backgroundColors[selectedEvent.type]
            : "white",
        }}
      >
        <div className="botonera">
          <button className="close-btn" onClick={handleEventClick}>
            Ver evento
          </button>
          <button className="close-btn" onClick={closePopup}>
            Cerrar
          </button>
        </div>
        {selectedEvent && (
          <div>
            <h2>{selectedEvent.title}</h2>
            <p>Estado: {selectedEvent.type}</p>
            <div className="insideHour">
              <div className="insideHour">
                <p>
                  <FontAwesomeIcon
                    icon={faClock}
                    style={{ color: "#b8b8b8" }}
                  />
                  {dayjs(selectedEvent.start).format("HH:mm")} -{" "}
                  {dayjs(selectedEvent.end).format("HH:mm")}
                </p>
                <p>
                  <FontAwesomeIcon
                    icon={faCalendarDays}
                    style={{ color: "#b8b8b8" }}
                  />
                  {dayjs(selectedEvent.start).format("DD / MM / YYYY")}
                </p>
                <p>
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    style={{ color: "#b8b8b8" }}
                  />
                </p>
              </div>
            </div>
            {/* <p>Host: {selectedEvent.host}</p> */}
          </div>
        )}
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

    console.log(
      "Mes mostrado:",
      formattedFirstDayOfMonth,
      "-",
      formattedLastDayOfMonth
    );

    // Aquí puedes hacer lo que necesites con el rango de fechas del mes
    // Por ejemplo, llamar a fetchEvents(formattedFirstDayOfMonth, formattedLastDayOfMonth) para obtener los eventos del mes
  };

  return (
    <div className="container">
      <div className="selector">
        <h3>Seleccion usuario</h3>
        <select
          name="profiles"
          id="profiles"
          value={selectedProfile}
          onChange={handleProfileChange}
        >
          <option value="">Seleccione un perfil</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
            </option>
          ))}
        </select>
      </div>
      <div className="calendar-size">
        <Calendar
          views={["month", "work_week", "day"]}
          localizer={localizer}
          messages={messages}
          events={events}
          step={10}
          timeslots={6}
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
  );
}

export default App;

