import React from "react";
import { Composition } from "remotion";
import {
  flightsSchema,
  flightsSeconds,
  locationSchema,
  locationSeconds,
  stingSchema,
  stingSeconds,
  titleSchema,
  titleSeconds,
  type FlightsProps,
  type LocationProps,
  type StingProps,
  type TitleProps,
} from "./briefs";
import { FlightsStory } from "./comps/FlightsStory";
import { LocationTag } from "./comps/LocationTag";
import { Sting } from "./comps/Sting";
import { TitleCard } from "./comps/TitleCard";
import { FORMATS, type FormatId } from "./lib/formats";
import { FPS } from "./lib/tokens";

// One composition per template and format, named "<Template>-<format>". The duration always
// follows the content (calculateMetadata), so a brief never states frames.

// Default props hold the required fields only. Remotion lays a brief over them key by key, so an
// optional field set here would appear in every film whose brief leaves it out.
const frames = (seconds: number) => Math.ceil(seconds * FPS);
const each = (ids: FormatId[]) => ids.map((id) => ({ id, ...FORMATS[id] }));

const stingDefaults: StingProps = { tone: "ink", hold: 1.6, out: "stay" };

const locationDefaults: LocationProps = { lang: "de", place: "Istanbul", lat: 41.0256, lon: 28.9742, hold: 3, scrim: true };
const titleDefaults: TitleProps = {
  lang: "de",
  eyebrow: "Anzeige · Novotel Istanbul",
  title: "Bosporus",
  hold: 3,
  scrim: true,
};
const flightsDefaults: FlightsProps = {
  kind: "flights",
  name: "flights-sample",
  lang: "de",
  partner: "Skyscanner",
  title: "Herbstflüge",
  keyword: "FLUG",
  asOf: "27.09.2026",
  deals: [
    { destination: "Rumänien", detail: "Direktflug", price: 30 },
    { destination: "Italien", detail: "Direktflug", price: 30 },
  ],
};

export const Root: React.FC = () => (
  <>
    {each(["reel", "square", "wide"]).map((f) => (
      <Composition
        key={f.id}
        id={`Sting-${f.id}`}
        component={Sting}
        schema={stingSchema}
        width={f.width}
        height={f.height}
        fps={FPS}
        durationInFrames={FPS}
        defaultProps={stingDefaults}
        calculateMetadata={({ props }) => ({ durationInFrames: frames(stingSeconds(props)) })}
      />
    ))}
    {each(["reel", "wide"]).map((f) => (
      <React.Fragment key={f.id}>
        <Composition
          id={`LocationTag-${f.id}`}
          component={LocationTag}
          schema={locationSchema}
          width={f.width}
          height={f.height}
          fps={FPS}
          durationInFrames={FPS}
          defaultProps={locationDefaults}
          calculateMetadata={({ props }) => ({ durationInFrames: frames(locationSeconds(props)) })}
        />
        <Composition
          id={`TitleCard-${f.id}`}
          component={TitleCard}
          schema={titleSchema}
          width={f.width}
          height={f.height}
          fps={FPS}
          durationInFrames={FPS}
          defaultProps={titleDefaults}
          calculateMetadata={({ props }) => ({ durationInFrames: frames(titleSeconds(props)) })}
        />
      </React.Fragment>
    ))}
    <Composition
      id="FlightsStory-story"
      component={FlightsStory}
      schema={flightsSchema}
      width={FORMATS.story.width}
      height={FORMATS.story.height}
      fps={FPS}
      durationInFrames={FPS}
      defaultProps={flightsDefaults}
      calculateMetadata={({ props }) => ({ durationInFrames: frames(flightsSeconds(props)) })}
    />
  </>
);
