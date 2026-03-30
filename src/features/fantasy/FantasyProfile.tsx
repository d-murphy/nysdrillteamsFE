import React, { useState } from "react";
import { useAuth } from "react-oidc-context";
import useRequireLogIn from "../../hooks/fantasy/useRequireLogIn";
import useTeamNames, { type FantasyTeamName } from "../../hooks/fantasy/useTeamNames";
import { Button, Form, Placeholder, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { useEditTeamName } from "../../hooks/fantasy/useEditTeamName";
import { FantasyPlayerKindIcon } from "./FantasyPlayerKindIcon";
import useDebounce from "../../shared/hooks/useDebounce";
import useTownNames from "../../hooks/fantasy/useTownNames";
import { Filter } from 'bad-words'
import useTeamNameSuggestions from "../../hooks/fantasy/useTeamNameSuggestions";
import useIsTeamNameAvailable from "../../hooks/fantasy/useIsTeamNameAvailable";

/** Default glyph color (API `insideColor`) when unset — matches muted icon look. */
const DEFAULT_ICON_COLOR = "#6c757d";
/** Default circle background (API `outsideColor`) when unset. */
const DEFAULT_BG_COLOR = "#e9ecef";

function normalizeHexForCompare(hex: string): string {
    return hex.trim().toLowerCase();
}

/** Ensures a value suitable for `<input type="color" />` (#rrggbb). */
function toColorInputValue(value: string | undefined, fallback: string): string {
    if (!value) return fallback;
    const t = value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(t)) return t;
    if (/^#[0-9a-fA-F]{3}$/.test(t)) {
        const r = t[1];
        const g = t[2];
        const b = t[3];
        return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    return fallback;
}

export default function FantasyProfile() {
    return (
        <div className="row g-3">
            <div className="col-12">
                <ProfileInfo />
            </div>
        </div>
    );
}



function ProfileInfo() {
    useRequireLogIn();
    const [editingTeamName, setEditingTeamName] = useState(false);
    const auth = useAuth();
    const email = auth.user?.profile.email ?? "";
    const { data: teamNamesData, } = useTeamNames(email ? [email] : []);
    const initialTeam = teamNamesData?.[0];
    const editFormKey = initialTeam
        ? `${initialTeam.email}|${initialTeam.town}|${initialTeam.name}|${initialTeam.insideColor ?? ""}|${initialTeam.outsideColor ?? ""}`
        : "no-team";

    return (
        <div className="bg-white rounded shadow-sm p-4">
            <div className="d-flex flex-column align-items-start justify-content-start w-100 gap-4">
                <EmailDisplay />
                {
                    editingTeamName ? 
                        <EditTeamNameForm
                            key={editFormKey}
                            setEditingTeamName={setEditingTeamName}
                            initialTeam={initialTeam}
                        />
                        :
                        <TeamNameDisplay setEditingTeamName={setEditingTeamName} />
                }
            </div>
        </div>
    )


}

interface EditTeamNameFormProps {
    setEditingTeamName: (editing: boolean) => void;
    initialTeam?: FantasyTeamName;
}

function EditTeamNameForm({ setEditingTeamName, initialTeam }: EditTeamNameFormProps) {
    const [town, setTown] = useState(() => initialTeam?.town ?? "");
    const [name, setName] = useState(() => initialTeam?.name ?? "");
    const [townSearch, setTownSearch] = useState("");
    const [numResults, setNumResults] = useState(10);
    const [draftIconColor, setDraftIconColor] = useState(() =>
        toColorInputValue(initialTeam?.insideColor, DEFAULT_ICON_COLOR)
    );
    const [draftBgColor, setDraftBgColor] = useState(() =>
        toColorInputValue(initialTeam?.outsideColor, DEFAULT_BG_COLOR)
    );
    const townSearchDebounced = useDebounce(townSearch, 500);
    const nameDebounced = useDebounce(name, 500);
    const { data: towns, isLoading: isLoadingTowns, error: errorTowns } = useTownNames(townSearchDebounced, numResults);
    const filter = new Filter(); 
    const { data: teamNameSuggestions, isLoading: isLoadingTeamNameSuggestions, error: errorTeamNameSuggestions, refetch: refetchTeamNameSuggestions } = useTeamNameSuggestions(town);
    const { isAvailable, isLoading: isLoadingAvailability } = useIsTeamNameAvailable(town, nameDebounced);

    const auth = useAuth();
    const userEmail = auth.user?.profile.email ?? "";
    const { refetch: refetchTeamNames } = useTeamNames(userEmail ? [userEmail] : []);

    const mutation = useEditTeamName(
        () => {
            setEditingTeamName(false);
            refetchTeamNames();
        },
        () => {}
    ); 

    const isInvalidName = filter.isProfane(name);
 
    const baselineIcon = toColorInputValue(initialTeam?.insideColor, DEFAULT_ICON_COLOR);
    const baselineBg = toColorInputValue(initialTeam?.outsideColor, DEFAULT_BG_COLOR);
    const insideColorChanged =
        normalizeHexForCompare(draftIconColor) !== normalizeHexForCompare(baselineIcon);
    const outsideColorChanged =
        normalizeHexForCompare(draftBgColor) !== normalizeHexForCompare(baselineBg);

    const isYourName = initialTeam?.town.toLowerCase() === town.toLowerCase() && initialTeam?.name.toLowerCase() === name.toLowerCase();

    const disableOnAvailability = isLoadingAvailability || (!isAvailable && !isYourName)
    const canSubmit = town.length > 0 && name.length > 0 && !isInvalidName && !disableOnAvailability;

    return (
        <div className="d-flex flex-column align-items-start justify-content-start gap-2 w-100">
            <Form.Label>Town</Form.Label>
            <Dropdown className="w-100">
                <Dropdown.Toggle
                    id="dropdown-town-search"
                    variant="outline-secondary"
                    className="w-100 text-start"
                >
                    {town ? town : "Search for a town"}
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    <div className="px-3 py-2">
                        <Form.Control
                            type="text"
                            placeholder="Search..."
                            value={townSearch}
                            onChange={(e) => setTownSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <Dropdown.Divider />
                    {isLoadingTowns ? (
                        <Dropdown.ItemText className="text-muted">Loading towns...</Dropdown.ItemText>
                    ) : errorTowns ? (
                        <Dropdown.ItemText className="text-danger">Unable to load towns</Dropdown.ItemText>
                    ) : towns && towns.length > 0 ? (
                        towns.map((townName) => (
                            <Dropdown.Item
                                key={townName}
                                onClick={() => {
                                    setTown(townName);
                                    setTownSearch("");
                                }}
                            >
                                {townName}
                            </Dropdown.Item>
                        ))
                    ) : (
                        <Dropdown.ItemText className="text-muted">No towns found</Dropdown.ItemText>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setNumResults((prev) => prev + 10);
                        }}
                    >
                        Show more results
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            <Form.Label>Team Name and Icon</Form.Label>
            <Form.Control 
                type="text" placeholder="Enter new team name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
            />
            {isInvalidName && <div className="text-danger px-1">Please, keep it clean.</div>}
            {town.length > 0 && nameDebounced.length > 0 && !isInvalidName && (
                isLoadingAvailability ? (
                    <div className="text-muted px-1">Checking availability...</div>
                ) : !isAvailable ? 
                        isYourName ? (
                            <div className="text-success px-1">This is your current team name.</div>
                        ) : (
                            <div className="text-danger px-1">This team name is not available.  Town / name combo must be unique and may not use actual team names.</div>
                        ) 
                : (
                    <div className="text-success px-1">Team name is available.</div>
                )
            )}

            <div className="d-flex flex-column align-items-start justify-content-start gap-2 small text-muted px-1 mt-2">
                { teamNameSuggestions && teamNameSuggestions.length > 0 && 
                    <div className="d-flex flex-row align-items-end justify-content-start gap-2">
                        <div>A few suggestions:</div>
                        <Button variant="icon" size="sm" className="pointer py-0 px-1"
                            onClick={() => refetchTeamNameSuggestions()}
                        >
                            <FontAwesomeIcon icon={faRefresh} />
                        </Button>
                    </div>
                }
                <div className="d-flex flex-row align-items-end justify-content-start gap-2">
                    { teamNameSuggestions && teamNameSuggestions.length > 0 && teamNameSuggestions.map((suggestion) => (
                        <span className="pointer video-links ms-1 " onClick={() => setName(suggestion)} key={suggestion}>{suggestion}</span>
                    ))}
                </div>
            </div>

            {userEmail && (
                <div className="d-flex flex-column align-items-start gap-2 w-100 border-top pt-3 mt-2">
                    <div className="small text-muted">Preview</div>
                    <div
                        className="d-flex align-items-center justify-content-center p-3 bg-light rounded w-100"
                        style={{ minHeight: "11rem" }}
                    >
                        <FantasyPlayerKindIcon
                            isAutodraft={false}
                            className="text-secondary"
                            userEmail={userEmail}
                            users={[userEmail]}
                            previewColors={{
                                insideColor: draftIconColor,
                                outsideColor: draftBgColor,
                            }}
                            sizeMultiplier={5}
                        />
                    </div>
                    <div className="d-flex flex-wrap align-items-end gap-3 w-100">
                        <Form.Group className="mb-0">
                            <Form.Label className="small text-muted mb-1">Color</Form.Label>
                            <Form.Control
                                type="color"
                                value={draftIconColor}
                                onChange={(e) => setDraftIconColor(e.target.value)}
                                title="Icon color"
                                className="form-control-color"
                            />
                        </Form.Group>
                        <Form.Group className="mb-0">
                            <Form.Label className="small text-muted mb-1">Background</Form.Label>
                            <Form.Control
                                type="color"
                                value={draftBgColor}
                                onChange={(e) => setDraftBgColor(e.target.value)}
                                title="Circle background"
                                className="form-control-color"
                            />
                        </Form.Group>
                    </div>
                </div>
            )}

            <div className="d-flex flex-row align-items-center justify-content-center w-100 gap-2">
                <Button className="align-self-center mt-3" variant="outline-secondary" onClick={() => setEditingTeamName(false)}>Cancel</Button>
                <Button 
                    className="align-self-center mt-3" 
                    variant="primary" 
                    onClick={() =>
                        mutation.mutate({
                            town,
                            name,
                            ...(insideColorChanged ? { insideColor: draftIconColor } : {}),
                            ...(outsideColorChanged ? { outsideColor: draftBgColor } : {}),
                        })
                    }
                    disabled={!canSubmit}
                >
                    Save
                </Button>
            </div>
            <div className="d-flex flex-column align-items-center justify-content-center gap-2 w-100 my-2">
                {
                    mutation.isPending && <div className="text-muted px-1">Saving...</div>
                }
                {
                    mutation.isError && <div className="text-danger px-1">Error: {mutation.error?.message}</div>
                }
            </div>
        </div>


    )
}

function EmailDisplay() {
    const auth = useAuth();

    return (
        <div className="d-flex flex-column align-items-start justify-content-center">
            <div className="small text-muted">Email</div>
            <div><b>{auth.user?.profile.email}</b></div>
        </div>
    )
}

interface TeamNameDisplayProps {
    setEditingTeamName: (editing: boolean) => void;
}

function TeamNameDisplay({ setEditingTeamName }: TeamNameDisplayProps) {
    const auth = useAuth();
    const email = auth.user?.profile.email ?? "";
    const { data: teamNamesData, isLoading: isLoadingTeamNames } = useTeamNames(email ? [email] : []);

    return (
        <div className="d-flex flex-column align-items-start justify-content-center w-100">
            <div className="d-flex align-items-end justify-content-start gap-2">
                <div className="small text-muted">Team Name</div>
                <Button className="py-0 px-1 pointer" variant="icon" onClick={() => setEditingTeamName(true)}><FontAwesomeIcon icon={faEdit} /></Button>
            </div>
            {isLoadingTeamNames ? (
                <div className="d-flex align-items-center gap-2 mt-1 w-100">
                    <Placeholder animation="glow" className="rounded-circle flex-shrink-0" style={{ width: "2rem", height: "2rem" }}>
                        <Placeholder xs={12} className="rounded-circle h-100" bg="secondary" />
                    </Placeholder>
                    <Placeholder animation="glow" className="p-0 flex-grow-1" style={{ maxWidth: "240px" }}>
                        <Placeholder xs={12} className="rounded" size="lg" bg="secondary" />
                    </Placeholder>
                </div>
            ) : (
                <div className="d-flex align-items-center gap-2 mt-1">
                    {email ? (
                        <FantasyPlayerKindIcon
                            isAutodraft={false}
                            className="text-secondary flex-shrink-0"
                            userEmail={email}
                            users={[email]}
                        />
                    ) : null}
                    <div>
                        <b>
                            {teamNamesData?.[0]?.town} {teamNamesData?.[0]?.name}
                        </b>
                    </div>
                </div>
            )}
        </div>
    );
}