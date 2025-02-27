import { useEffect, useState, ChangeEvent, useRef, useCallback } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import "@aws-amplify/ui-react/styles.css";

import { MapboxOverlayProps } from "@deck.gl/mapbox/typed";
import "@aws-amplify/ui-react/styles.css";

import "maplibre-gl/dist/maplibre-gl.css"; // Import maplibre-gl styles
import { NavigationControl, MapRef } from "react-map-gl";

import { Map, MapProps, useControl, Popup } from "react-map-gl";
import maplibregl from "maplibre-gl";

import { MapboxOverlay } from "@deck.gl/mapbox/typed";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  Input,
  Flex,
  Button,
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
  ThemeProvider,
  Theme,
  Divider,
  ScrollView,
  //Tabs,
  ToggleButton,
  // TextField,
} from "@aws-amplify/ui-react";

import "@aws-amplify/ui-react/styles.css";
import { GeoJsonLayer } from "@deck.gl/layers/typed";

import { uploadData } from "aws-amplify/storage";

// Define the type for the file object
type FileType = File | null;

const client = generateClient<Schema>();

const theme: Theme = {
  name: "table-theme",
  tokens: {
    components: {
      table: {
        row: {
          hover: {
            backgroundColor: { value: "{colors.blue.20}" },
          },

          striped: {
            backgroundColor: { value: "{colors.orange.10}" },
          },
        },

        header: {
          color: { value: "{colors.blue.80}" },
          fontSize: { value: "{fontSizes.x3}" },
          borderColor: { value: "{colors.blue.20}" },
        },

        data: {
          fontWeight: { value: "{fontWeights.semibold}" },
        },
      },
    },
  },
};

const AIR_PORTS =
  "https://u7wrupm2a5.execute-api.us-east-1.amazonaws.com/test/getData";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { signOut } = useAuthenticator();

  const [person, setPerson] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  //const [report, setReport] = useState("");
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [resolved, setResolved] = useState(false);

  const [file, setFile] = useState<FileType>();
  //const [tab, setTab] = useState("1");
  //const [showPopup, setShowPopup] = useState(true);
  const [selected, setSelected] = useState([]);

  const layers = [
    new GeoJsonLayer({
      id: "airports",
      data: AIR_PORTS,
      // Styles
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 5,
      getPointRadius: 2,
      getFillColor: [200, 0, 80, 180],
      // Interactive props
      pickable: true,
      autoHighlight: true,
      //onClick: (info) => setSelected(info.object),
      // beforeId: 'watername_ocean' // In interleaved mode, render the layer under map labels
    }),
  ];

  const handleChange = (event: any) => {
    setFile(event.target.files?.[0]);
  };

  const handleClick = () => {
    if (!file) {
      return;
    }
    uploadData({
      path: `picture-submissions/${file.name}`,
      data: file,
    });
    console.log(file);
  };

  const handlePerson = (e: ChangeEvent<HTMLInputElement>) => {
    setPerson(e.target.value);
  };
  const handleDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };
  const handleDate = (e: ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleClick1 = useCallback((info: any /* event: any */) => {
    if (info.object) {
      // console.log(
      //   info.object.properties
      // );
      setSelected(info.object.properties);
      console.log(selected);
    } else {
      //console.log('Clicked on the map at:', info.coordinate);
    }
  }, []);

  const handleHover = useCallback((info: any /* event: any */) => {
    if (info.object) {
      // console.log("Hover object:", info.object);
      // setHoverInfo(info.object);
    } else {
      // console.log('Hover on the map at:', info.coordinate);
    }
  }, []);

  const mapRef = useRef<MapRef | null>(null);
  const [viewState, setViewState] = useState<MapProps["viewState"]>({
    longitude: -80.20321,
    latitude: 26.00068,
    zoom: 17,
    pitch: 0,
    bearing: 0,
  } as any);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({
      person: person,
      description: description,
      date: date,
      report: file?.name,
      lat: lat,
      long: lng,
      status: resolved,
    });
    setPerson("");
    setDescription("");
    setDate("");
    setLat(0);
    setLng(0);
    setResolved(false);
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  const openInNewTab = (url: any) => {
    window.open(url, "_blank", "noreferrer");
  };

  return (
    <main>
      <h1>Washington Park Project Complaint Data</h1>
      <Divider orientation="horizontal" />
      <br />
      <Flex>
        <Button onClick={signOut} width={120}>
          Sign out
        </Button>
        <Button onClick={createTodo} backgroundColor={"azure"} color={"red"}>
          + new
        </Button>
        <Button
          role="link"
          onClick={() =>
            openInNewTab(
              "https://washington-2-map-fixed.d2qs7f7sc8f3m1.amplifyapp.com"
            )
          }
          //onClick={() => getPlacesData()}
        >
          Map
        </Button>
      </Flex>
      <br />
      <Flex direction="row">
        <input
          type="text"
          value={person}
          placeholder="person"
          onChange={handlePerson}
          width="250%"
        />
        <input
          type="text"
          value={description}
          placeholder="description"
          onChange={handleDescription}
          width="150%"
        />

        <input
          type="date"
          value={date}
          placeholder="date"
          onChange={handleDate}
          width="150%"
        />
        <Input type="number" value={lat} width="150%" />
        <Input type="number" value={lng} width="150%" />
        <input type="file" onChange={handleChange} />
        <Button onClick={handleClick}>Upload</Button>
        <ToggleButton
          isPressed={resolved}
          onChange={() => setResolved(!resolved)}
        >
          Resolve (click)
        </ToggleButton>
      </Flex>
      <Divider orientation="horizontal" />
      <br />
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        mapStyle={MAP_STYLE} // Use any MapLibre-compatible style
        {...viewState}
        onMove={({ viewState }) => setViewState(viewState as any)}
        style={{ width: "100%", height: "800px" }}
      >
        <DeckGLOverlay
          layers={layers}
          // interleaved
          //controller={true}
          onClick={handleClick1}
          onHover={handleHover}
        ></DeckGLOverlay>
        {selected && (
          <Popup
            longitude={-80.20321}
            latitude={26.00068}
            anchor="bottom"
            // onClose={() => setShowPopup(false)}
          >
            You are here
          </Popup>
        )}
        <NavigationControl position="top-left" />
      </Map>
      <Divider orientation="horizontal" />
      <br />

      <ScrollView
        as="div"
        ariaLabel="View example"
        backgroundColor="var(--amplify-colors-white)"
        borderRadius="6px"
        //border="1px solid var(--amplify-colors-black)"
        // boxShadow="3px 3px 5px 6px var(--amplify-colors-neutral-60)"
        color="var(--amplify-colors-blue-60)"
        // height="45rem"
        // maxWidth="100%"
        padding="1rem"
        // width="100%"
        width="2400px"
        height={"2400px"}
        maxHeight={"2400px"}
        maxWidth="2400px"
      >
        <ThemeProvider theme={theme} colorMode="light">
          <Table caption="" highlightOnHover={false}>
            <TableHead>
              <TableRow>
                <TableCell as="th">Name</TableCell>
                <TableCell as="th">Description</TableCell>
                <TableCell as="th">Date</TableCell>
                <TableCell as="th">Report</TableCell>
                <TableCell as="th">Latitude</TableCell>
                <TableCell as="th">Longitude</TableCell>
                <TableCell as="th">Resolved</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {todos.map((todo) => (
                <TableRow onClick={() => deleteTodo(todo.id)} key={todo.id}>
                  <TableCell>{todo.person}</TableCell>
                  <TableCell>{todo.description}</TableCell>
                  <TableCell>{todo.date}</TableCell>
                  <TableCell>{todo.report}</TableCell>
                  <TableCell>{todo.lat}</TableCell>
                  <TableCell>{todo.long}</TableCell>
                  <TableCell>{todo.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ThemeProvider>
      </ScrollView>

      {/* <button onClick={signOut}>Sign out</button> */}
    </main>
  );
}

export default App;
