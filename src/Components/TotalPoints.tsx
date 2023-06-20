import * as React from "react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


declare var SERVICE_URL: string;

interface TotalPointsProp {
    year: number
    headingAligned: boolean
}

type Regions = "Nassau" | "Northern" | "Suffolk" | "Western" | "Junior"; 

export const JR_CONTEST_STR = "Jr Division - Junior Ladder,Jr Division - Intermediate Ladder,Jr Division - Individual Ladder,Jr Division - Cart Ladder," + 
    "Jr Division - Junior Cart Hose,Jr Division - Cart Hose,Jr Division - Cart Replacement,Jr Division - Junior Eff. Replacement,Jr Division - Wye," + 
    "Jr Division - Efficiency,Jr Division - Junior Wye"

export default function TotalPoints(props:TotalPointsProp) {
    let year = props.year; 
    const headingAligned = props.headingAligned; 

    let url = `${SERVICE_URL}/runs/getTotalPoints?year=${year}&byContest=true&totalPointsFieldName=`; 
    let jrUrl = `${SERVICE_URL}/runs/getTotalPoints?year=${year}&byContest=true&totalPointsFieldName=Junior&contests=${JR_CONTEST_STR}`

    const regionData: {[index: string]: {}[]} = {}; 
    const [region, setRegion] = useState<"" | Regions>(""); 
    const [selectedRegionTpArr, setTpArr] = useState<{}[]>([]); 

    const [isLoading, setIsLoading] = useState(false); 
    const [errorLoading, setErrorLoading] = useState(false); 
    const [noMoreClicks, setNoMoreClicks] = useState(false); 

    const fetchTotalPoints = (region:Regions) => {
        let urlWithRegion = `${url}${region}`; 
        let urlForFetch = region !== "Junior" ? urlWithRegion : jrUrl; 
        fetch(urlForFetch)
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
                <div className="col-12 col-md-3">
                    <div className="d-flex flex-column align-items-center mb-1">
                        {
                            headingAligned ? 
                                <div className="align-self-start"><p><span className="h4">Total Points</span></p></div> : 
                                <div><p><span className="h4">Total Points</span></p></div>

                        }

                        <div className={`${region == "Nassau" ? "circuit-selected" : "circuit-not-selected" } m-1 px-3 py-2 rounded text-center w-100`} onClick={() => selectRegion("Nassau")}>Nassau</div>
                        <div className={`${region == "Northern" ? "circuit-selected" : "circuit-not-selected" } m-1 px-3 py-2 rounded text-center w-100`} onClick={() => selectRegion("Northern")}>Northern</div>
                        <div className={`${region == "Suffolk" ? "circuit-selected" : "circuit-not-selected" } m-1 px-3 py-2 rounded text-center w-100`} onClick={() => selectRegion("Suffolk")}>Suffolk</div>
                        <div className={`${region == "Western" ? "circuit-selected" : "circuit-not-selected" } m-1 px-3 py-2 rounded text-center w-100`} onClick={() => selectRegion("Western")}>Western</div>
                        <div className={`${region == "Junior" ? "circuit-selected" : "circuit-not-selected" } m-1 px-3 py-2 rounded text-center w-100`} onClick={() => selectRegion("Junior")}>Junior</div>
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
                            <div style={{ width: '100%', height: 500 }}>
                                {selectedRegionTpArr.length ? 
                                    <Chart data={selectedRegionTpArr} year={year} region={region} />
                                    : <div className="w-100 text-center mt-5">No total points reported.</div>                        
                                }
                            </div>
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

//@ts-ignore
const CustomTooltip = ({ active, payload, label }:props) => {    
    if (active && payload && payload.length) {
        let totalPts = 0; 
        payload.forEach((el:any) => {
            totalPts += el.value; 
        })
      return (
        <div className="custom-tooltip">
            <div><b>Total: {totalPts}</b></div>
            <br />
            {
                payload.map((el:any) => <div>{el.dataKey} - {el.value}</div>)
            }
            <br />
            <div><i>Click a bar section to view runs.</i></div>
        </div>
      );
    }
  
    return null;
  };

interface ChartProps {
    data: {}[], 
    year: number, 
    region: string
}

function Chart({data, year, region}:ChartProps){
    const [barsNotDisplayed, setBarsNotDisplayed] = useState([])
    const toggleLegend = (event:{value:string}) => {
        if(barsNotDisplayed.includes(event.value.trim())){
            const newArr = barsNotDisplayed.filter(el => el != event.value.trim())
            setBarsNotDisplayed(newArr)
        } else {
            setBarsNotDisplayed([...barsNotDisplayed, event.value.trim()])
        }
    }
    const regionPtrStr:{[index:string]:string} = {
        "Nassau": "nassauPoints=true", 
        "Northern": "northernPoints=true", 
        "Suffolk": "suffolkPoints=true", 
        "Western": "westernPoints=true", 
        "Junior": "juniorPoints=true"
    }

    const handleBarClick = (data:{team:string, tooltipPayload: {name:string}[]}) => {
        if(!regionPtrStr[region]) return
        const team = data.team; 
        const contest = data.tooltipPayload[0].name; 
        const paramString = `?years=${year}&teams=${team}&contests=${contest}&${regionPtrStr[region]}`
        window.open(`/RunSearch${paramString}`, '_blank');        
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
            <Tooltip content={<CustomTooltip />} />
            <Legend 
                wrapperStyle={{fontSize: "10px"}} 
                onClick={toggleLegend} 
                formatter={(value) => {
                    return barsNotDisplayed.includes(value.trim()) ? 
                    <span style={{opacity: "40%", cursor: 'pointer'}}>{value.trim()}</span> : 
                    <span style={{cursor:'pointer'}}>{value}</span>
                }}
                />

            {
                region != "Junior" ? 
                    <>
                        {/* Extra space trick to keep text display, but hide bar.  Extra space is trimmed in handler */}
                        <Bar dataKey={barsNotDisplayed.includes("Three Man Ladder") ? "Three Man Ladder " : "Three Man Ladder"}  stackId="a" fill="#91c5fd" radius={1}  onClick={handleBarClick} style={{cursor:'pointer'}}/>
                        <Bar dataKey={barsNotDisplayed.includes("B Ladder") ? "B Ladder " : "B Ladder"} stackId="a" fill="#61acfd" radius={1} onClick={handleBarClick} style={{cursor:'pointer'}}/>
                        <Bar dataKey={barsNotDisplayed.includes("C Ladder") ? "C Ladder " : "C Ladder"} stackId="a" fill="#3093fd" radius={1} onClick={handleBarClick} style={{cursor:'pointer'}}/>
                        <Bar dataKey={barsNotDisplayed.includes("C Hose") ? "C Hose " : "C Hose"} stackId="a" fill="#0279fa" radius={1} onClick={handleBarClick} style={{cursor:'pointer'}}/>
                        <Bar dataKey={barsNotDisplayed.includes("B Hose") ? "B Hose " : "B Hose"} stackId="a" fill="#0162ca" radius={1} onClick={handleBarClick} style={{cursor:'pointer'}}/>
                        <Bar dataKey={barsNotDisplayed.includes("Efficiency") ? "Efficiency " : "Efficiency"} stackId="a" fill="#014a99" radius={1} onClick={handleBarClick} style={{cursor:'pointer'}}/>
                        <Bar dataKey={barsNotDisplayed.includes("Motor Pump") ? "Motor Pump " : "Motor Pump"} stackId="a" fill="#013369" radius={1} onClick={handleBarClick} style={{cursor:'pointer'}}/>
                        <Bar dataKey={barsNotDisplayed.includes("Buckets") ? "Buckets " : "Buckets"} stackId="a" fill="#001b38" radius={1} onClick={handleBarClick} style={{cursor:'pointer'}}/>                    
                    </> : 
                    <>
                        <Bar dataKey={barsNotDisplayed.includes("Jr Division - Junior Ladder") ? "Jr Division - Junior Ladder " : "Jr Division - Junior Ladder"}  stackId="a" fill="#91c5fd" radius={1}  onClick={handleBarClick} style={{cursor:'pointer'}}/>
                        <Bar dataKey={barsNotDisplayed.includes("Jr Division - Intermediate Ladder") ? "Jr Division - Intermediate Ladder " : "Jr Division - Intermediate Ladder"} stackId="a" fill="#61acfd" radius={1} onClick={handleBarClick} style={{cursor:'pointer'}}/>
                        <Bar dataKey={barsNotDisplayed.includes("Jr Division - Individual Ladder") ? "Jr Division - Individual Ladder " : "Jr Division - Individual Ladder"} stackId="a" fill="#3093fd" radius={1} onClick={handleBarClick} style={{cursor:'pointer'}}/>
                        <Bar dataKey={barsNotDisplayed.includes("Jr Division - Cart Ladder") ? "Jr Division - Cart Ladder " : "Jr Division - Cart Ladder"} stackId="a" fill="#0279fa" radius={1} onClick={handleBarClick} style={{cursor:'pointer'}}/>
                        <Bar dataKey={barsNotDisplayed.includes("Jr Division - Junior Cart Hose") ? "Jr Division - Junior Cart Hose " : "Jr Division - Junior Cart Hose"} stackId="a" fill="#0162ca" radius={1} onClick={handleBarClick} style={{cursor:'pointer'}}/>
                        <Bar dataKey={barsNotDisplayed.includes("Jr Division - Cart Hose") ? "Jr Division - Cart Hose " : "Jr Division - Cart Hose"} stackId="a" fill="#014a99" radius={1} onClick={handleBarClick} style={{cursor:'pointer'}}/>
                        <Bar dataKey={barsNotDisplayed.includes("Jr Division - Cart Replacement") ? "Jr Division - Cart Replacement " : "Jr Division - Cart Replacement"} stackId="a" fill="#013369" radius={1} onClick={handleBarClick} style={{cursor:'pointer'}}/>
                        <Bar dataKey={barsNotDisplayed.includes("Jr Division - Junior Eff. Replacement") ? "Jr Division - Junior Eff. Replacement " : "Jr Division - Junior Eff. Replacement"} stackId="a" fill="#001b38" radius={1} onClick={handleBarClick} style={{cursor:'pointer'}}/>                    
                        <Bar dataKey={barsNotDisplayed.includes("Jr Division - Junior Wye") ? "Jr Division - Junior Wye " : "Jr Division - Junior Wye"} stackId="a" fill="#001b38" radius={1} onClick={handleBarClick} style={{cursor:'pointer'}}/>                    
                        <Bar dataKey={barsNotDisplayed.includes("Jr Division - Wye") ? "Jr Division - Wye " : "Jr Division - Wye"} stackId="a" fill="#000b18" radius={1} onClick={handleBarClick} style={{cursor:'pointer'}}/>                    
                        <Bar dataKey={barsNotDisplayed.includes("Jr Division - Efficiency") ? "Jr Division - Efficiency " : "Jr Division - Efficiency"} stackId="a" fill="#000008" radius={1} onClick={handleBarClick} style={{cursor:'pointer'}}/>                    
                    </>
            }
          </BarChart>
        </ResponsiveContainer>
      );
}