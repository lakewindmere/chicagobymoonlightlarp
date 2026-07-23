'use client';
import { Cinzel } from "next/font/google";
const cinzel = Cinzel({ subsets: ['latin'] });
export const Timeline = () => {
    const timelineSteps: {time: string, text: string}[] = [{
        time: "5:00 PM",
        text: "Doors Open"
    }, {
        time: "5:30 PM",
        text: "Optional Character Workshop"
    }, {
        time: "6:30 PM",
        text: "All players should be present"
    }, {
        time: "6:50 PM",
        text: "Announcements"
    }, {
        time: "7:00 PM",
        text: "Session begins"
    }, {
        time: "11:00 PM",
        text: "Session ends"
    }];

    return (
        <ul className="flex flex-col">
            { timelineSteps.map((step, index) => {
                return (
                    <li key={step.time} className="grid grid-cols-[45%_36px_45%] grid-rows-1 min-h-[50px] relative">
                        <div className={`${cinzel.className} text-sm pt-[4px] font-bold md:font-normal sm:text-lg md:text-2xl grow shrink-0 md:shrink font-bold flex-1 pr-6 pl-6 text-center md:text-right`}>{step.time}</div>
                        <div className="flex grow-0 shrink-0 flex-col h-min-7" aria-hidden={true}>
                            <span className=" border-2 border-red-700 p-[4px] rounded-full bg-mauve-700/35">🩸</span>
                            { index !== timelineSteps.length - 1 && <span className=" grow-1 w-[3px] m-auto bg-red-700/50 min-h-8 md:min-h-14"> </span> }
                        </div>
                        <div className={`${cinzel.className} grow-2 pt-[4px] md:grow w-min:0 wrap-break-word md:wrap-normal text-center md:text-left text-sm font-bold md:font-normal sm:text-lg md:text-2xl flex-1 pr-6 pl-6`}>{step.text}</div>
                    </li>
                );
            })}
        </ul> 
    )
}
