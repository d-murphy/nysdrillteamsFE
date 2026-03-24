import * as React from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLoginContext } from "../utils/context";
import { fetchGet, fetchPost } from "../utils/network";
import { User } from '../types/types'
import { capFirst } from "../utils/strings";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import MutationStatus from "./MutationStatus";

declare var SERVICE_URL: string;

interface AdminUsersProps {}

export default function AdminUpdates(_props:AdminUsersProps) {
    const [formValid, setFormValid] = useState(false);
    const [usernameMessage, setUsernameMessage] = useState<{error: boolean, message: string} | null>(null);
    const [userInReview, setUserInReview] = useState<{username:string, role:string, password?:string, _id?:string}>({username:'', role: '', password:''})

    const { sessionId, role  } = useLoginContext();
    const isAdmin = role === "admin";
    const queryClient = useQueryClient();

    const { data, isError } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: () => fetchGet(`${SERVICE_URL}/users/getUsers`, sessionId).then(res => res.json()),
        enabled: Boolean(sessionId),
    });

    const users = data ?? [];

    const addUserMutation = useMutation({
        mutationFn: () => fetchPost(
            `${SERVICE_URL}/users/insertUser`,
            { username: userInReview.username, password: userInReview.password, role: userInReview.role },
            sessionId
        ),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });

    const deleteUserMutation = useMutation({
        mutationFn: () => fetchPost(
            `${SERVICE_URL}/users/deleteUser`,
            { userId: userInReview._id },
            sessionId
        ),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });

    function cleanNewUserModal(){
        setFormValid(false);
        setUsernameMessage(null);
        setUserInReview({...{username:'', role: '', password: generatePassword()}})
        addUserMutation.reset();
    }

    function cleanDeleteModal(){
        deleteUserMutation.reset();
    }

    function handleUsernameChange(e:React.ChangeEvent<HTMLInputElement>){
        const taken = users.some(el => el.username == e.target.value);
        setUsernameMessage(taken ? { error: true, message: "Username not available." } : null);
        setFormValid(!taken);
        setUserInReview({ ...userInReview, [e.target.id]: e.target.value })
    }

    function handleSelect(e:React.ChangeEvent<HTMLSelectElement>){
        setUserInReview({ ...userInReview, [e.target.id]: e.target.value })
    }

    function handleAddUser(){
        if(!userInReview.username.length || !userInReview.role.length){
            setUsernameMessage({ error: true, message: "Username and role required." });
            return;
        }
        addUserMutation.mutate();
    }

    return (
        <div className="container">
            { isError ?
                <div className="row">
                    <div className="col-12 d-flex flex-column align-items-center mt-5">
                        <div className="">Sorry, there was an error loading users.</div>
                    </div>
                </div> : <></>
            }
            { !isError ?
                <>
                    <div className="d-flex flex-column align-items-center justify-content-center">
                        <div
                            className="btn add-entry-button my-5"
                            data-bs-toggle="modal"
                            data-bs-target="#newUserModal"
                            onClick={() => cleanNewUserModal()}>Create User
                        </div>

                        <div className="w-100 mx-5 rounded bg-light py-4 mb-2">
                            <div className="row my-1">
                                <div className="col-5">
                                    <div className="test-center d-flex justify-content-center align-items-center ">
                                        <div className="font-large">Username</div>
                                    </div>
                                </div>
                                <div className="col-5">
                                    <div className="test-center d-flex justify-content-center align-items-center ">
                                        <div className="font-large">Role</div>
                                    </div>
                                </div>
                                <div className="col-2"></div>
                            </div>
                            {
                                users.map((user, ind) => (
                                    <div className="row my-1" key={ind}>
                                        <div className="col-5">
                                            <div className="test-center d-flex justify-content-center align-items-center ">
                                                <div className="font-large">{user.username}</div>
                                            </div>
                                        </div>
                                        <div className="col-5">
                                            <div className="test-center d-flex justify-content-center align-items-center ">
                                                <div className="font-large">{capFirst(user.role)}</div>
                                            </div>
                                        </div>
                                        <div className="col-2">
                                            {user.role != 'admin' ?
                                                <div className="pointer px-3"
                                                data-bs-toggle="modal"
                                                data-bs-target="#deleteUserModal"
                                                onClick={()=>{
                                                    cleanDeleteModal();
                                                    setUserInReview({...user});
                                                }}
                                                ><FontAwesomeIcon className="crud-links font-x-large" icon={faTrash}/>
                                                </div> : <></>
                                            }
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    <div className="modal fade" id="newUserModal" aria-labelledby="newUserModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-l">
                            <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="newUserModalLabel">New User</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="row my-1">
                                    <div className="col-4 text-center">Username</div>
                                    <div className="col-8 text-center px-4">
                                        <input
                                            onChange={(e) => handleUsernameChange(e)}
                                            id="username"
                                            value={userInReview.username}
                                            className="text-center width-100"
                                            disabled={!isAdmin}
                                            autoComplete="off"></input>
                                    </div>
                                </div>
                                <div className="row my-1">
                                    <div className="col-4 text-center">Password</div>
                                    <div className="col-8 text-center px-4">
                                        <input
                                            id="password"
                                            value={userInReview.password}
                                            className="text-center width-100"
                                            disabled={true}
                                            autoComplete="off"></input>
                                    </div>
                                </div>
                                <div className="row my-1">
                                    <div className="col-4 text-center">Role</div>
                                    <div className="col-8 text-center px-4">
                                        <select onChange={handleSelect} id="role" name="role" className="width-100 text-center py-1" value={userInReview.role} disabled={!isAdmin}>
                                            <option value={null}></option>
                                            <option value={"scorekeeper"}>Scorekeeper</option>
                                            <option value={"video"}>Video Only</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer d-flex flex-column">
                                <div className="text-center my-3">
                                    {usernameMessage && (
                                        <span className={usernameMessage.error ? 'text-danger' : 'text-success'}>
                                            {usernameMessage.message}
                                        </span>
                                    )}
                                    <MutationStatus isSuccess={addUserMutation.isSuccess} isError={addUserMutation.isError} />
                                    {!isAdmin ? <span>Only Admin can make changes.</span> : <></>}
                                </div>
                                <div className="">
                                    <button type="button" className="btn btn-secondary mx-2" data-bs-dismiss="modal">Close</button>
                                    <button type="button" className="btn btn-primary mx-2" onClick={handleAddUser} disabled={!isAdmin || !formValid || addUserMutation.isPending}>Save changes</button>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal fade" id="deleteUserModal" aria-labelledby="deleteUserModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-l">
                            <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="deleteUserModalLabel">Delete User?</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete {userInReview.username}?</p>
                                <p><i>Any DB changes made by the user are unaffected.</i></p>
                            </div>
                            <div className="modal-footer d-flex flex-column">
                                <div className="text-center my-3">
                                    <MutationStatus isSuccess={deleteUserMutation.isSuccess} isError={deleteUserMutation.isError} successMessage="Deletion successful." />
                                    {!isAdmin ? <span>Only Admin can make changes.</span> : <></>}
                                </div>
                                <div className="">
                                    <button type="button" className="btn btn-secondary mx-2" data-bs-dismiss="modal">Close</button>
                                    <button type="button" className="btn btn-primary mx-2" onClick={() => deleteUserMutation.mutate()} disabled={!isAdmin || deleteUserMutation.isPending}>Delete</button>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>

                </> : <></>
            }
        </div>
    )
}

function generatePassword() {
    var length = 12,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}
