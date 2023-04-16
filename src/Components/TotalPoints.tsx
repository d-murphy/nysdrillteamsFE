import * as React from "react";
import { useEffect, useState } from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


declare var SERVICE_URL: string;

interface TotalPointsProp {
    year: number
}

type Regions = "Nassau" | "Northern" | "Suffolk" | "Western"; 

export default function TotalPoints(props:TotalPointsProp) {
    let year = props.year; 

    let url = `${SERVICE_URL}/runs/getTotalPoints?year=${year}&byContest=true&totalPointsFieldName=`; 

    const regionData: {[index: string]: {}[]} = {}; 
    const [region, setRegion] = useState<"" | Regions>(""); 
    const [selectedRegionTpArr, setTpArr] = useState<{}[]>([]); 

    const [isLoading, setIsLoading] = useState(false); 
    const [errorLoading, setErrorLoading] = useState(false); 
    const [noMoreClicks, setNoMoreClicks] = useState(false); 

    const fetchTotalPoints = (region:Regions) => {
        let urlWithRegion = `${url}${region}`; 
        fetch(urlWithRegion)
        .then(response => response.json())
        .then(data => {
            const teamData: {[index:string]: {[index:string]: number | string}} = {}; 
            data.forEach((el: {_id: {contest: string, team: string}, points: number}) => {
                if(!teamData[el._id.team]){
                    teamData[el._id.team] = {team: el._id.team}; 
                }
                teamData[el._id.team][el._id.contest] = el.points; 
            })
            let teamDataArr = Object.values(teamData); 
            teamDataArr = teamDataArr.map(el => {
                let totalPoints = 0; 
                for (const [key, value] of Object.entries(el)) {
                    if(!["team"].includes(key)) totalPoints += value as number
                }
                return {
                    points: totalPoints, 
                    ...el
                }
            })
            teamDataArr = teamDataArr.sort((a,b) => {
                return a.points < b.points ? 1 : -1;
            })
            regionData[region] = teamDataArr; 
            setTpArr(teamDataArr);
            setNoMoreClicks(false); 
            setIsLoading(false); 
        })
        .catch(err => {
            console.log(err)
            setErrorLoading(true); 
            setIsLoading(false);
        })
    }

    const selectRegion = (region:Regions) => {
        if(!noMoreClicks){
            setRegion(region); 
            if(regionData[region]){
                setTpArr(regionData[region]);
            } else {
                setNoMoreClicks(true)
                setIsLoading(true); 
                fetchTotalPoints(region);     
            }
        }
    }

    useEffect(() => {
        selectRegion('Nassau'); 
    }, [])

    let content = (
        <div className="my-2 py-3 px-2">
            <div className="row">
            <p><span className="h4 me-3">Total Points</span><i></i></p>
            </div>
            <div className="row">
                <div className="col-12 col-md-3">
                    <div className="d-flex flex-column align-items-center mb-1">
                        <div className={`${region == "Nassau" ? "circuit-selected" : "circuit-not-selected" } m-1 px-3 py-2 rounded text-center w-100`} onClick={() => selectRegion("Nassau")}>Nassau</div>
                        <div className={`${region == "Northern" ? "circuit-selected" : "circuit-not-selected" } m-1 px-3 py-2 rounded text-center w-100`} onClick={() => selectRegion("Northern")}>Northern</div>
                        <div className={`${region == "Suffolk" ? "circuit-selected" : "circuit-not-selected" } m-1 px-3 py-2 rounded text-center w-100`} onClick={() => selectRegion("Suffolk")}>Suffolk</div>
                        <div className={`${region == "Western" ? "circuit-selected" : "circuit-not-selected" } m-1 px-3 py-2 rounded text-center w-100`} onClick={() => selectRegion("Western")}>Western</div>
                    </div>                
                </div>
                <div className="col-12 col-md-9">
                    { errorLoading ? 
                        <div className="row">
                            <div className="col-12 d-flex flex-column align-items-center mt-5">
                                <div className="">Sorry, there was an error loading the total points.</div>
                            </div>
                        </div> : <></>
                    }
                    { isLoading ? 
                        <div className="row">
                            <div className="col-12 d-flex flex-column align-items-center mt-5">
                                <div className="spinner-border text-secondary" role="status"></div>
                            </div>
                        </div> : <></>                    
                    }
                    { !isLoading && !errorLoading ?
                        <div className="w-100 big8-bg shadow-sm rounded px-4 py-4 d-flex flex-column align-items-center">
                            {selectedRegionTpArr.length ? 
                                <div style={{ width: '100%', height: 500 }}>
                                    <Chart data={selectedRegionTpArr} />
                                </div>
                                : <div>No total points were recorded.</div>                        
                            }
                            <div className="mt-4 font-x-small text-center"><i>Total points reflect runs saved in DB and may not match official results.</i></div>
                        </div> : 
                        <></>                    
                    }
                </div>

            </div>
        </div>
    )
    return content; 
}

interface ChartProps {
    data: {}[]
}

function Chart({data}:ChartProps){
    const [barsNotDisplayed, setBarsNotDisplayed] = useState([])
    const toggleLegend = (event:{value:string}) => {
        if(barsNotDisplayed.includes(event.value.trim())){
            const newArr = barsNotDisplayed.filter(el => el != event.value.trim())
            setBarsNotDisplayed(newArr)
        } else {
            setBarsNotDisplayed([...barsNotDisplayed, event.value.trim()])
        }
    }

    return (
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            width={500}
            height={500}
            data={data}
            margin={{
              top: 20,
              right: 20,
              left: 100,
              bottom: 5,
            }}
          >
            <XAxis type="number"/>
            <YAxis dataKey="team" type="category" tick={{ width: 200, fontSize:'9px' }}/>
            <Tooltip wrapperStyle={{fontSize: "10px"}} labelStyle={{fontSize: "12px"}}  />
            <Legend 
                wrapperStyle={{fontSize: "10px"}} 
                onClick={toggleLegend} 
                formatter={(value) => {
                    return barsNotDisplayed.includes(value.trim()) ? 
                    <span style={{opacity: "40%", cursor: 'pointer'}}>{value.trim()}</span> : 
                    <span style={{cursor:'pointer'}}>{value}</span>
                }}
                />
            {/* Extra space trick to keep text display, but hide bar.  Extra space is trimmed in handler */}
            <Bar dataKey={barsNotDisplayed.includes("Three Man Ladder") ? "Three Man Ladder " : "Three Man Ladder"}  stackId="a" fill="#91c5fd" radius={1}  />
            <Bar dataKey={barsNotDisplayed.includes("B Ladder") ? "B Ladder " : "B Ladder"} stackId="a" fill="#61acfd" radius={1} />
            <Bar dataKey={barsNotDisplayed.includes("C Ladder") ? "C Ladder " : "C Ladder"} stackId="a" fill="#3093fd" radius={1} />
            <Bar dataKey={barsNotDisplayed.includes("C Hose") ? "C Hose " : "C Hose"} stackId="a" fill="#0279fa" radius={1} />
            <Bar dataKey={barsNotDisplayed.includes("B Hose") ? "B Hose " : "B Hose"} stackId="a" fill="#0162ca" radius={1} />
            <Bar dataKey={barsNotDisplayed.includes("Efficiency") ? "Efficiency " : "Efficiency"} stackId="a" fill="#014a99" radius={1} />
            <Bar dataKey={barsNotDisplayed.includes("Motor Pump") ? "Motor Pump " : "Motor Pump"} stackId="a" fill="#013369" radius={1} />
            <Bar dataKey={barsNotDisplayed.includes("Buckets") ? "Buckets " : "Buckets"} stackId="a" fill="#001b38" radius={1} />
          </BarChart>
        </ResponsiveContainer>
      );
}
