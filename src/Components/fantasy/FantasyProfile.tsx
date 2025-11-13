import React, { useCallback, useState } from "react";
import { useAuth } from "react-oidc-context";
import useRequireLogIn from "../../hooks/useRequireLogIn";
import useTeamNames from "../../hooks/useTeamNames";
import { Button, Form, Placeholder, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { useEditTeamName } from "../../hooks/useEditTeamName";
import useDebounce from "../../hooks/useDebounce";
import useTownNames from "../../hooks/useTownNames";
import { Filter } from 'bad-words'
import useTeamNameSuggestions from "../../hooks/useTeamNameSuggestions";

export default function FantasyProfile() {
    return (
        <div className="row g-3">
            <div className="d-none d-lg-block col-9">
                1
            </div>
            <div className="d-none d-lg-block col-3">
                <ProfileInfo />
            </div>
            <div className="d-block d-lg-none col-12">
                <div>
                    <ProfileInfo />
                </div>
                <div className="mt-3">
                    4
                </div>
            </div>
        </div>


        // <div className="bg-white rounded shadow-sm p-4">
        //     <div className="d-flex flex-column align-items-center justify-content-center">

        //         <ProfileInfo />


        //     </div>            
        // </div>
    );
}



function ProfileInfo() {
    useRequireLogIn();
    const [editingTeamName, setEditingTeamName] = useState(false);



    return (
        <div className="bg-white rounded shadow-sm p-4">
            <div className="d-flex flex-column align-items-start justify-content-start w-100 gap-4">
                <EmailDisplay />
                {
                    editingTeamName ? 
                        <EditTeamNameForm setEditingTeamName={setEditingTeamName} />
                        :
                        <TeamNameDisplay setEditingTeamName={setEditingTeamName} />
                }
            </div>
        </div>
    )


}

interface EditTeamNameFormProps {
    setEditingTeamName: (editing: boolean) => void;
}

function EditTeamNameForm({ setEditingTeamName }: EditTeamNameFormProps) {
    const [town, setTown] = useState("");
    const [name, setName] = useState(""); 
    const [townSearch, setTownSearch] = useState("");
    const [numResults, setNumResults] = useState(10); 
    const townSearchDebounced = useDebounce(townSearch, 500);
    const { data: towns, isLoading: isLoadingTowns, error: errorTowns } = useTownNames(townSearchDebounced, numResults);
    const filter = new Filter(); 
    const { data: teamNameSuggestions, isLoading: isLoadingTeamNameSuggestions, error: errorTeamNameSuggestions, refetch: refetchTeamNameSuggestions } = useTeamNameSuggestions(town);

    const auth = useAuth();
    const { refetch: refetchTeamNames } = useTeamNames([auth.user?.profile.email]);

    const mutation = useEditTeamName(
        () => {
            setEditingTeamName(false);
            refetchTeamNames();
        },
        (error: any) => {
            console.error("Error editing team name", error);
        }
    ); 

    const isInvalidName = filter.isProfane(name);

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
            <Form.Label>Team Name</Form.Label>
            <Form.Control 
                type="text" placeholder="Enter new team name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
            />
            {isInvalidName && <div className="text-danger">Please, keep it clean.</div>}

            <div className="d-flex flex-column align-items-start justify-content-start gap-2 font-small text-muted px-1 mt-2">
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
                { teamNameSuggestions && teamNameSuggestions.length > 0 && teamNameSuggestions.map((suggestion) => (
                    <span className="pointer video-links ms-1 " onClick={() => setName(suggestion)} key={suggestion}>{suggestion}</span>
                ))}
            </div>

            <div className="d-flex flex-row align-items-center justify-content-center w-100 gap-2">
                <Button className="align-self-center mt-3" variant="outline-secondary" onClick={() => setEditingTeamName(false)}>Cancel</Button>
                <Button className="align-self-center mt-3" variant="primary" onClick={() => mutation.mutate({ town, name })}>Save</Button>
            </div>
        </div>


    )
}

// interface NameSuggestionsProps {
//     town: string
// }

// function NameSuggestions() {
//     const { nameSuggestions, isLoading: isLoadingNameSuggestions, error: errorNameSuggestions } = useNameSuggestions(town);
//     const 



// }



function EmailDisplay() {
    const auth = useAuth();

    return (
        <div className="d-flex flex-column align-items-start justify-content-center">
            <div className="font-small text-muted">Email</div>
            <div><b>{auth.user?.profile.email}</b></div>
        </div>
    )
}

interface TeamNameDisplayProps {
    setEditingTeamName: (editing: boolean) => void;
}

function TeamNameDisplay({ setEditingTeamName }: TeamNameDisplayProps){
    const auth = useAuth();
    const { data: teamNamesData, isLoading: isLoadingTeamNames, error: errorTeamNames } = useTeamNames([auth.user?.profile.email]);

    return (
        <div className="d-flex flex-column align-items-start justify-content-center w-100">
            <div className="d-flex align-items-end justify-content-start gap-2">
                <div className="font-small text-muted">Team Name</div>
                <Button className="py-0 px-1 pointer" variant="icon" onClick={() => setEditingTeamName(true)}><FontAwesomeIcon icon={faEdit} /></Button>
            </div>
            {
                isLoadingTeamNames ? 
                    <Placeholder animation="glow" className="p-0 text-center d-block width-50 mt-1">
                        <Placeholder xs={12} className="rounded" size="lg" bg="secondary"/>
                    </Placeholder>
                    : 
                    <div className="mt-1"><b>{teamNamesData?.[0]?.town} {teamNamesData?.[0]?.name}</b></div>
            }
        </div>
    )

}