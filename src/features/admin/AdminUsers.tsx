import * as React from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLoginContext } from "../../utils/context";
import { fetchGet, fetchPost } from "../../utils/network";
import { User } from '../../types/types'
import { capFirst } from "../../utils/strings";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import MutationStatus from "../../shared/components/MutationStatus";

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

    const roleBadgeClass = (r: string) =>
        r === 'admin' ? 'bg-danger' : r === 'scorekeeper' ? 'bg-primary' : 'bg-secondary';

    return (
        <div>
            {isError && (
                <div className="alert alert-danger">Sorry, there was an error loading users.</div>
            )}
            {!isError && (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">Users</h6>
                        <button
                            className="btn btn-success btn-sm"
                            data-bs-toggle="modal"
                            data-bs-target="#newUserModal"
                            onClick={() => cleanNewUserModal()}
                        >+ Create User</button>
                    </div>

                    <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                        <table className="table table-sm table-hover mb-0">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th style={{ width: '48px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, ind) => (
                                    <tr key={ind}>
                                        <td className="align-middle">{user.username}</td>
                                        <td className="align-middle">
                                            <span className={`badge ${roleBadgeClass(user.role)}`}>{capFirst(user.role)}</span>
                                        </td>
                                        <td className="align-middle text-center">
                                            {user.role !== 'admin' && (
                                                <span
                                                    className="pointer"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#deleteUserModal"
                                                    onClick={() => { cleanDeleteModal(); setUserInReview({...user}); }}
                                                >
                                                    <FontAwesomeIcon className="crud-links" icon={faTrash}/>
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* New User Modal */}
                    <div className="modal fade" id="newUserModal" aria-labelledby="newUserModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="newUserModalLabel">Create New User</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3 row align-items-center">
                                        <label htmlFor="username" className="col-4 col-form-label fw-semibold text-end">Username</label>
                                        <div className="col-8">
                                            <input
                                                id="username"
                                                onChange={(e) => handleUsernameChange(e)}
                                                value={userInReview.username}
                                                className="form-control form-control-sm"
                                                disabled={!isAdmin}
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3 row align-items-center">
                                        <label htmlFor="password" className="col-4 col-form-label fw-semibold text-end">Generated Password</label>
                                        <div className="col-8">
                                            <input
                                                id="password"
                                                value={userInReview.password}
                                                className="form-control form-control-sm font-monospace"
                                                disabled
                                                autoComplete="off"
                                            />
                                            <div className="form-text">Share this with the new user. They can change it after logging in.</div>
                                        </div>
                                    </div>
                                    <div className="mb-3 row align-items-center">
                                        <label htmlFor="role" className="col-4 col-form-label fw-semibold text-end">Role</label>
                                        <div className="col-8">
                                            <select
                                                id="role"
                                                onChange={handleSelect}
                                                className="form-select form-select-sm"
                                                value={userInReview.role}
                                                disabled={!isAdmin}
                                            >
                                                <option value=""></option>
                                                <option value="scorekeeper">Scorekeeper</option>
                                                <option value="video">Video Only</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer flex-column align-items-stretch gap-2">
                                    {usernameMessage && (
                                        <div className={`text-center small ${usernameMessage.error ? 'text-danger' : 'text-success'}`}>
                                            {usernameMessage.message}
                                        </div>
                                    )}
                                    <MutationStatus isSuccess={addUserMutation.isSuccess} isError={addUserMutation.isError} />
                                    {!isAdmin && <div className="text-center small text-muted">Only Admin can make changes.</div>}
                                    <div className="d-flex justify-content-end gap-2">
                                        <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                                        <button type="button" className="btn btn-primary btn-sm" onClick={handleAddUser} disabled={!isAdmin || !formValid || addUserMutation.isPending}>Create User</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delete User Modal */}
                    <div className="modal fade" id="deleteUserModal" aria-labelledby="deleteUserModalLabel" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="deleteUserModalLabel">Delete User?</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <p>Are you sure you want to delete <strong>{userInReview.username}</strong>?</p>
                                    <p className="text-muted small"><i>Any DB changes made by the user are unaffected.</i></p>
                                </div>
                                <div className="modal-footer flex-column align-items-stretch gap-2">
                                    <MutationStatus isSuccess={deleteUserMutation.isSuccess} isError={deleteUserMutation.isError} successMessage="Deletion successful." />
                                    {!isAdmin && <div className="text-center small text-muted">Only Admin can make changes.</div>}
                                    <div className="d-flex justify-content-end gap-2">
                                        <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                                        <button type="button" className="btn btn-warning btn-sm" onClick={() => deleteUserMutation.mutate()} disabled={!isAdmin || deleteUserMutation.isPending}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
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
