import React, {useState} from 'react'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faTrash, faPlus, faVideo } from "@fortawesome/free-solid-svg-icons"; 
import { Run } from "../../types/types"

interface RunVideosProps {
    runInReview: Run, 
    setRunInReview: React.Dispatch<React.SetStateAction<Run>>
}

export default function RunVideos(props:RunVideosProps) {
    const runInReview = props.runInReview; 
    const setRunInReview = props.setRunInReview; 

    let [showUrlInput, setShowUrlInput] = useState(false); 
    let [newUrl, setNewUrl] = useState(""); 

    function handleLinkTextInput(e:React.ChangeEvent<HTMLInputElement>){
        setNewUrl(e.target.value)
    }

    function addVideoLink(){
        if(!newUrl.toLowerCase().includes('youtube')){
            setNewUrl(''); 
            return; 
        }
        let urls = runInReview.urls && runInReview.urls.length ? runInReview.urls : []; 
        setRunInReview({
            ...runInReview, 
            urls: [...urls, newUrl]
        })
        setNewUrl(""); 
        setShowUrlInput(false);
    }

    function removeVideoLink(index:number){
        let urls = runInReview.urls;  
        urls = urls.filter((el, ind) => ind != index ); 
        setRunInReview({
            ...runInReview, 
            urls: [...urls]
        })
    }



    return (
        <div className="col-6 d-flex flex-column align-items-center">
            <div className='text-center'>Run Videos <FontAwesomeIcon className="mx-2" icon={faPlus} onClick={() => setShowUrlInput(true)} /> </div>
            {runInReview.urls.map((el, ind) => {
                return (
                    <div className="my-1 text-center" key={ind}>
                        <a href={el}><FontAwesomeIcon icon={faVideo} size='sm' className="mx-2"/></a>
                        <FontAwesomeIcon icon={faTrash} size='sm' onClick={() => removeVideoLink(ind)} className="mx-2"/>

                    </div>)
            })}
            {showUrlInput ? <div className="d-flex justify-content-around align-items-center mt-2 text-center">
                    <input className="w-50" id='newUrl' name='newUrl' value={newUrl} onChange={handleLinkTextInput} placeholder="Add video url here"/>
                    <FontAwesomeIcon icon={faPlus} size='sm' onClick={addVideoLink} className="mx-2"/>
                </div> : <></>}
        </div>

    )
}
