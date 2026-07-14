import React, { useEffect, useMemo, useRef, useState } from "react";
import { Run, Tournament, Track } from "../types/types";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { Form, Placeholder } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronLeft,
    faLocationDot,
    faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { Bar, BarChart, Label, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dateUtil from "../utils/dateUtils";
import { TimeCellContents } from "../features/tournament/Scorecard";

declare var SERVICE_URL: string;
declare var MAPS_API_KEY: string;

const BIG8_CONTESTS = [
    "Three Man Ladder",
    "B Ladder",
    "C Ladder",
    "C Hose",
    "B Hose",
    "Efficiency",
    "Motor Pump",
    "Buckets",
];

export default function Locations() {
    const params = useParams();
    const navigate = useNavigate();
    const trackSelected = params.location;

    const setTrackSelected = (track: string) => {
        if (!track) {
            navigate("/Locations");
            return;
        }
        navigate(`/Locations/${encodeURIComponent(track)}`);
    };

    const {
        data: rawTracks,
        isLoading: loading,
        isError: errorLoading,
    } = useQuery<Track[]>({
        queryKey: ["tracks"],
        queryFn: () =>
            fetch(`${SERVICE_URL}/tracks/getTracks`).then((res) => res.json()),
    });

    const tracks = useMemo(
        () => (rawTracks ?? []).filter((el) => el.display),
        [rawTracks]
    );

    const { data: trackTourns = [], isLoading: tournsLoading } = useQuery<
        Tournament[]
    >({
        queryKey: ["trackTournaments", trackSelected],
        queryFn: () =>
            fetch(
                `${SERVICE_URL}/tournaments/getFilteredTournaments?tracks=${encodeURIComponent(
                    trackSelected
                )}`
            ).then((res) => res.json()),
        enabled: Boolean(trackSelected),
    });

    const { data: topRunsByContest = [], isLoading: recordsLoading } = useQuery<
        Run[][]
    >({
        queryKey: ["trackRecords", trackSelected],
        queryFn: () =>
            fetch(
                `${SERVICE_URL}/runs/getTopRuns?tracks=${encodeURIComponent(
                    trackSelected
                )}`
            ).then((res) => res.json()),
        enabled: Boolean(trackSelected),
    });

    const trackRecords = useMemo(
        () =>
            topRunsByContest
                .map((runs, ind) => runs?.[0])
                .filter((run): run is Run => Boolean(run?.contest && run?.time)),
        [topRunsByContest]
    );

    const selectedTrackInfo = tracks.find((el) => el.name === trackSelected);

    if (tracks.length && trackSelected && !selectedTrackInfo) {
        return (
            <div className="container mb-3">
                <div className="text-center w-100 fs-4 my-3">
                    <b>Track Locations</b>
                </div>
                <div className="bg-white rounded shadow-sm p-4 text-center">
                    <div className="text-muted mb-3">
                        Sorry, we're missing info on this track.
                    </div>
                    <Link to="/Locations" className="video-links">
                        Back to all tracks
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mb-3">
            <div className="text-center w-100 fs-4 my-3">
                <b>Track Locations</b>
            </div>
            <div className="text-center text-muted small mb-3">
                Browse the map or pick a track to see details, history, and
                records.
            </div>

            <StateHandler
                loading={loading}
                error={errorLoading}
                trackSelected={trackSelected}
            >
                <div className="row g-3">
                    <div className="col-12 col-lg-4">
                        <div className="locations-panel bg-white rounded shadow-sm p-3 p-md-4 h-100">
                            {trackSelected && selectedTrackInfo ? (
                                <TrackInfo
                                    track={selectedTrackInfo}
                                    setTrackSelected={setTrackSelected}
                                    trackTourns={trackTourns}
                                    tournsLoading={tournsLoading}
                                />
                            ) : (
                                <TrackDirectory
                                    tracks={tracks}
                                    setTrackSelected={setTrackSelected}
                                />
                            )}
                        </div>
                    </div>
                    <div className="col-12 col-lg-8">
                        <div className="locations-panel bg-white rounded shadow-sm p-2 p-md-3 locations-map-panel">
                            <LocationMapWrapper
                                setTrackSelected={setTrackSelected}
                                tracks={tracks}
                                selectedTrack={trackSelected}
                                mapsApiKey={MAPS_API_KEY}
                            />
                        </div>
                    </div>
                </div>

                {trackSelected && (
                    <>
                        {(tournsLoading || trackTourns.length > 0) && (
                            <div className="locations-panel bg-white rounded shadow-sm p-3 p-md-4 mt-3">
                                {tournsLoading ? (
                                    <PanelLoading />
                                ) : (
                                    <TournamentHistory tourns={trackTourns} />
                                )}
                            </div>
                        )}

                        <div className="locations-panel bg-white rounded shadow-sm p-3 p-md-4 mt-3 mb-2">
                            {recordsLoading ? (
                                <PanelLoading />
                            ) : trackRecords.length ? (
                                <TrackRecords records={trackRecords} />
                            ) : (
                                <>
                                    <div className="locations-section-label mb-2">
                                        Track records
                                    </div>
                                    <div className="text-muted small">
                                        No Big 8 records found for this track.
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </StateHandler>
        </div>
    );
}

interface TrackDirectoryProps {
    tracks: Track[];
    setTrackSelected: (track: string) => void;
}

function TrackDirectory({ tracks, setTrackSelected }: TrackDirectoryProps) {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return [...tracks]
            .sort((a, b) => {
                if (a.active && !b.active) return -1;
                if (!a.active && b.active) return 1;
                return a.name.localeCompare(b.name);
            })
            .filter((el) => {
                if (!q) return true;
                const haystack = `${el.name} ${el.city || ""} ${el.address || ""}`.toLowerCase();
                return haystack.includes(q);
            });
    }, [tracks, query]);

    return (
        <div className="locations-directory">
            <div className="locations-section-label mb-1">Find a track</div>
            <div className="text-muted small mb-3">
                Search the directory or click a marker on the map.
            </div>
            <Form.Control
                type="search"
                placeholder="Search by name or city"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mb-3"
                aria-label="Search tracks"
            />
            <div className="locations-track-list">
                {filtered.length === 0 ? (
                    <div className="text-muted small py-3 text-center">
                        No tracks match that search.
                    </div>
                ) : (
                    filtered.map((track) => (
                        <button
                            key={track.name}
                            type="button"
                            className="locations-track-item"
                            onClick={() => setTrackSelected(track.name)}
                        >
                            <span className="locations-track-item-name">
                                {track.name}
                            </span>
                            <span className="locations-track-item-meta">
                                {track.city || "—"}
                                {!track.active ? " · inactive" : ""}
                            </span>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

interface TournamentHistoryProps {
    tourns: Tournament[];
}

function TournamentHistory({ tourns }: TournamentHistoryProps) {
    const sorted = [...tourns].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const navigate = useNavigate();

    return (
        <>
            <div className="locations-section-label mb-3">
                Tournament history
            </div>
            <div className="locations-tourn-scroll">
                {sorted.map((el) => (
                    <button
                        key={el.id}
                        type="button"
                        className="locations-tourn-chip"
                        onClick={() => navigate(`/Tournament/${el.id}`)}
                    >
                        <span className="locations-tourn-chip-name">{el.name}</span>
                        <span className="locations-tourn-chip-date">
                            {new Date(el.date).toLocaleDateString()}
                        </span>
                    </button>
                ))}
            </div>
        </>
    );
}

interface TrackRecordsProps {
    records: Run[];
}

function TrackRecords({ records }: TrackRecordsProps) {
    const navigate = useNavigate();

    const sorted = [...records].sort((a, b) => {
        const aIdx = BIG8_CONTESTS.indexOf(a.contest);
        const bIdx = BIG8_CONTESTS.indexOf(b.contest);
        return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });

    return (
        <>
            <div className="locations-section-label mb-3">Track records</div>
            <div className="table-responsive">
                <table className="table table-sm w-100 other-tables mb-0">
                    <thead>
                        <tr>
                            <th scope="col" className="bg-white">
                                Tournament
                            </th>
                            <th scope="col" className="text-start">
                                Team
                            </th>
                            <th scope="col" className="text-start">
                                Contest
                            </th>
                            <th scope="col" className="text-end">
                                Time
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((el) => {
                            const dateDisplay = dateUtil.getMMDDYYYY(el.date);
                            const tournDisplay = el.tournament || "";

                            return (
                                <tr key={`trackrecord-${el._id}`}>
                                    <td
                                        className="pointer"
                                        onClick={() =>
                                            navigate(`/Tournament/${el.tournamentId}`)
                                        }
                                    >
                                        {dateDisplay && tournDisplay
                                            ? `${dateDisplay} - ${tournDisplay}`
                                            : dateDisplay || tournDisplay}
                                    </td>
                                    <td className="text-start">{el.team}</td>
                                    <td className="text-start">{el.contest}</td>
                                    <td className="text-end">
                                        <TimeCellContents run={el} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}

interface TrackInfoProps {
    track: Track;
    setTrackSelected: (str: string) => void;
    trackTourns: Tournament[];
    tournsLoading: boolean;
}

function TrackInfo({
    track,
    setTrackSelected,
    trackTourns,
    tournsLoading,
}: TrackInfoProps) {
    const stateTournYears = trackTourns
        .filter((el) => el.name === "New York State Championship")
        .map((el) => el.year)
        .sort((a, b) => a - b);

    const addressLine = [track.address, track.city].filter(Boolean).join(", ");
    const directionsUrl =
        track.latitude && track.longitude
            ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${track.latitude},${track.longitude}`
              )}`
            : addressLine
              ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    addressLine
                )}`
              : "";

    const specs: string[] = [];
    if (
        track.archHeightFt &&
        track.archHeightFt !== 999 &&
        track.archHeightInches != null &&
        track.archHeightInches !== 999
    ) {
        specs.push(`Arch ${track.archHeightFt}'${track.archHeightInches}"`);
    }
    if (track.distanceToHydrant && track.distanceToHydrant !== 999) {
        specs.push(`${track.distanceToHydrant} ft to hydrant`);
    }

    return (
        <div className="d-flex flex-column h-100">
            <button
                type="button"
                className="locations-back-link mb-3 align-self-start"
                onClick={() => setTrackSelected("")}
            >
                <FontAwesomeIcon icon={faChevronLeft} className="me-1" />
                All tracks
            </button>

            <div className="d-flex align-items-start gap-2 mb-2">
                <FontAwesomeIcon
                    icon={faLocationDot}
                    className="mt-1 text-muted"
                />
                <div>
                    <h4 className="mb-1">{track.name}</h4>
                    {addressLine ? (
                        <div className="text-muted small">{addressLine}</div>
                    ) : null}
                </div>
            </div>

            {directionsUrl ? (
                <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="video-links small mb-3 d-inline-flex align-items-center gap-1"
                >
                    Get directions
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                </a>
            ) : null}

            {specs.length > 0 && (
                <div className="locations-specs mb-3">
                    {specs.map((spec) => (
                        <span key={spec} className="locations-spec">
                            {spec}
                        </span>
                    ))}
                </div>
            )}

            {!tournsLoading && stateTournYears.length > 0 && (
                <div className="small mb-2">
                    <span className="locations-meta-label">
                        State tournaments hosted
                    </span>
                    <div>{stateTournYears.join(", ")}</div>
                </div>
            )}

            {track.notes ? (
                <div className="small text-muted mb-2">{track.notes}</div>
            ) : null}

            {!track.active ? (
                <div className="small fst-italic mb-2">
                    This track is no longer in active use.
                </div>
            ) : null}

            {!track.latitude || !track.longitude ? (
                <div className="small fst-italic mb-2">
                    Map coordinates are missing for this track.
                </div>
            ) : null}

            <div className="flex-grow-1" />

            <div className="mt-3">
                <div className="locations-section-label mb-2">Years active</div>
                {tournsLoading ? (
                    <Placeholder animation="glow">
                        <Placeholder
                            className="rounded w-100"
                            style={{ height: 60 }}
                            bg="secondary"
                        />
                    </Placeholder>
                ) : trackTourns.length ? (
                    <YearsActiveChart tournaments={trackTourns} />
                ) : (
                    <div className="text-muted small">
                        No tournament years on file.
                    </div>
                )}
            </div>
        </div>
    );
}

function PanelLoading() {
    return (
        <div>
            <Placeholder animation="glow" className="d-block mb-3">
                <Placeholder xs={4} className="rounded" bg="secondary" />
            </Placeholder>
            <Placeholder animation="glow" className="d-block">
                <Placeholder xs={12} className="rounded" bg="secondary" />
            </Placeholder>
        </div>
    );
}

interface StateHandlerProps {
    loading: boolean;
    trackSelected: string;
    error: boolean;
    children: React.ReactNode;
}

function StateHandler({
    loading,
    trackSelected,
    error,
    children,
}: StateHandlerProps) {
    if (loading) {
        return (
            <div className="row g-3">
                <div className="col-12 col-lg-4">
                    <div className="locations-panel bg-white rounded shadow-sm p-3 p-md-4">
                        {trackSelected ? (
                            <div className="d-flex flex-column gap-3">
                                <Placeholder animation="glow">
                                    <Placeholder
                                        className="rounded w-50 height-30"
                                        bg="secondary"
                                    />
                                </Placeholder>
                                <Placeholder animation="glow">
                                    <Placeholder
                                        className="rounded w-100 minheight-180"
                                        bg="secondary"
                                    />
                                </Placeholder>
                            </div>
                        ) : (
                            <Placeholder animation="glow">
                                <Placeholder
                                    className="rounded w-100 height-30"
                                    bg="secondary"
                                />
                            </Placeholder>
                        )}
                    </div>
                </div>
                <div className="col-12 col-lg-8">
                    <Placeholder animation="glow">
                        <Placeholder
                            className="w-100 rounded locations-map-panel"
                            bg="secondary"
                        />
                    </Placeholder>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded shadow-sm p-4 text-center text-muted">
                There was an error loading location data. Please try again later.
            </div>
        );
    }

    return <>{children}</>;
}

const MapLoadingBlock = () => (
    <Placeholder animation="glow" className="w-100">
        <Placeholder
            className="w-100 locations-map-panel rounded"
            bg="secondary"
        />
    </Placeholder>
);

const otherMapStates = (status: Status) => {
    if (status === Status.FAILURE) return <div>Failed to load map</div>;
    if (status === Status.LOADING) return <MapLoadingBlock />;
};

interface LocationMapWrapperProp {
    tracks: Track[];
    selectedTrack?: string;
    mapsApiKey: string;
    setTrackSelected: (str: string) => void;
}

function LocationMapWrapper({
    tracks,
    selectedTrack,
    mapsApiKey,
    setTrackSelected,
}: LocationMapWrapperProp) {
    return (
        <Wrapper apiKey={mapsApiKey} render={otherMapStates}>
            <LocationMap
                tracks={tracks}
                selectedTrack={selectedTrack}
                setTrackSelected={setTrackSelected}
            />
        </Wrapper>
    );
}

interface LocationMapProp {
    tracks: Track[];
    selectedTrack: string;
    setTrackSelected: (str: string) => void;
}

function LocationMap({
    tracks,
    selectedTrack,
    setTrackSelected,
}: LocationMapProp) {
    const ref = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map>();
    const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

    const iconBase = {
        path: "M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
        fillColor: "#546f8a",
        fillOpacity: 0.8,
        strokeWeight: 0,
        rotation: 0,
        scale: 8,
        anchor: new google.maps.Point(8, 8.5),
    };
    const normalIcon = { icon: { ...iconBase, fillOpacity: 0.55 } };
    const activeIcon = { icon: { ...iconBase, fillColor: "#013369" } };
    const selectedIcon = {
        icon: { ...iconBase, fillColor: "#c45c26", scale: 10 },
    };

    useEffect(() => {
        const bounds = new google.maps.LatLngBounds();
        const track = selectedTrack
            ? tracks.find((el) => el?.name === selectedTrack)
            : undefined;

        if (track && track.latitude && track.longitude) {
            bounds.extend({
                lat: parseFloat(track.latitude),
                lng: parseFloat(track.longitude),
            });
        } else {
            tracks.forEach((t) => {
                if (t.latitude && t.longitude) {
                    bounds.extend({
                        lat: parseFloat(t.latitude),
                        lng: parseFloat(t.longitude),
                    });
                }
            });
        }

        if (ref.current && !map) {
            const myMap = new google.maps.Map(ref.current, {
                mapTypeControl: false,
                streetViewControl: false,
            });
            setMap(myMap);
            if (track && track.latitude && track.longitude) {
                myMap.setCenter({
                    lat: parseFloat(track.latitude),
                    lng: parseFloat(track.longitude),
                });
                myMap.setZoom(15);
            } else {
                myMap.fitBounds(bounds);
            }
        } else if (map) {
            map.fitBounds(bounds);
            if (track && track.latitude && track.longitude) map.setZoom(15);
        }
    }, [tracks, selectedTrack]);

    useEffect(() => {
        if (!map) return;
        markers.forEach((marker) => marker.setMap(null));
        setMarkers([]);

        const newMarkerArr: google.maps.Marker[] = [];
        tracks
            .sort((a, b) => (a.active && !b.active ? 1 : -1))
            .forEach((track) => {
                if (!track.latitude || !track.longitude) return;

                const contentStr =
                    track.address && track.city
                        ? `<br/><div><b>${track.name}</b></div><div>${track.address}</div><div>${track.city}</div>`
                        : `<br/><div><b>${track.name}</b></div>`;

                const infoWindow = new google.maps.InfoWindow({
                    content: contentStr,
                    ariaLabel: `${track.name}-marker`,
                });

                const isSelected = selectedTrack === track.name;
                const iconChange = isSelected
                    ? selectedIcon
                    : track.active
                      ? activeIcon
                      : normalIcon;

                const marker = new google.maps.Marker({
                    ...iconChange,
                    position: {
                        lat: parseFloat(track.latitude),
                        lng: parseFloat(track.longitude),
                    },
                    map: map,
                });
                marker.addListener("mouseover", () => {
                    infoWindow.open({ anchor: marker });
                });
                marker.addListener("mouseout", () => {
                    infoWindow.close();
                });
                marker.addListener("click", () => {
                    setTrackSelected(track.name);
                });
                newMarkerArr.push(marker);
            });
        setMarkers([...newMarkerArr]);
    }, [tracks, selectedTrack, map]);

    if (selectedTrack && !tracks.find((el) => el?.name === selectedTrack)) {
        return (
            <div className="p-4 text-muted small">
                Track is missing location data.
            </div>
        );
    }

    return <div ref={ref} className="w-100 locations-map" />;
}

interface YearsActiveChartProps {
    tournaments: Tournament[];
}

function YearsActiveChart({ tournaments }: YearsActiveChartProps) {
    const counter = tournaments.reduce(
        (accum: Record<number, number>, el) => {
            if (!accum[el.year]) {
                accum[el.year] = 1;
            }
            return accum;
        },
        {}
    );
    const data = Object.keys(counter).map((el) => ({
        year: parseInt(el),
        numTourns: counter[parseInt(el)],
    }));

    return (
        <div style={{ width: "100%", height: 60 }}>
            <ResponsiveContainer>
                <BarChart
                    layout="horizontal"
                    data={data}
                    margin={{
                        top: 5,
                        right: 5,
                        left: 0,
                        bottom: 10,
                    }}
                >
                    <XAxis
                        dataKey="year"
                        type="number"
                        domain={[1945, new Date().getFullYear() + 2]}
                        ticks={[1960, 1980, 2000, 2020]}
                    >
                        <Label value="Year" position="bottom" offset={-5} />
                    </XAxis>
                    <YAxis
                        dataKey="numTourns"
                        type="number"
                        domain={[0, 1]}
                        hide
                    />
                    <Bar
                        dataKey={"numTourns"}
                        fill="#013369"
                        radius={2}
                        maxBarSize={5}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
