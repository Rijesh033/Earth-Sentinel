
var SITES = {
    earth: [
        {
            id: 'haughton',
            n: 'Haughton Crater, Devon Island',
            c: 'Nunavut, Canada',
            lat: 75.4,
            lon: -89.8,
            t: 'both',
            moon: 'shackleton',
            mars: 'utopia',
            s: 'A 23-million-year-old impact crater in a polar desert. NASA’s Haughton-Mars Project has tested rovers, suits and habitats here for 25+ years.',
            p: 'Remote Arctic communities need medicine, logistics and shelter far from help. Tele-medicine and rugged-transport tech proven here serves them.',
            st: [['Temp', '−15 to 10 °C'], ['Crater', '23 km'], ['Analog', 'Ice + impacts'], ['Since', '1997']]
        },
        {
            id: 'hiseas',
            n: 'HI-SEAS Habitat, Mauna Loa',
            c: 'Hawaii, USA',
            lat: 19.6,
            lon: -155.5,
            t: 'both',
            moon: 'marius',
            mars: 'jezero',
            s: 'A dome habitat on a barren lava field at 2,500 m. Crews live for months in isolation, wearing suits outside, eating mission food.',
            p: 'Crew psychology, team conflict and off-grid solar living studied here help isolated workers: polar stations, oil rigs, long-term care.',
            st: [['Altitude', '2,500 m'], ['Missions', '4–12 months'], ['Power', 'Solar'], ['Analog', 'Lava + isolation']]
        },
        {
            id: 'atacama',
            n: 'Atacama Desert',
            c: 'Chile',
            lat: -24.5,
            lon: -69.25,
            t: 'mars',
            mars: 'gale',
            s: 'The driest non-polar place on Earth. Some weather stations have never recorded rain. Soil is so hostile that life detection tools are tested here.',
            p: 'Fog nets and moisture-harvesting developed for arid soils provide drinking water to villages. Drought-resilient farming is learned here.',
            st: [['Rain', '<15 mm/yr'], ['UV', 'Extreme'], ['Analog', 'Mars soil'], ['Altitude', '2,400 m+']]
        },
        {
            id: 'dryvalleys',
            n: 'McMurdo Dry Valleys',
            c: 'Antarctica',
            lat: -77.5,
            lon: 162.5,
            t: 'mars',
            mars: 'utopia',
            s: 'Ice-free, frozen, windy valleys with permafrost and microbes living inside rocks — the closest thing on Earth to present-day Mars.',
            p: 'Cold-climate construction, ice-water recovery and life-in-extremes research feed polar infrastructure and climate-change science.',
            st: [['Temp', '−20 °C avg'], ['Wind', '320 km/h'], ['Analog', 'Mars permafrost'], ['Life', 'Rock microbes']]
        },
        {
            id: 'mdrs',
            n: 'Mars Desert Research Station',
            c: 'Utah, USA',
            lat: 38.4,
            lon: -110.8,
            t: 'mars',
            mars: 'jezero',
            s: 'A two-story habitat among red sandstone badlands. Volunteer crews run two-week missions with strict EVA and resource rules.',
            p: 'Closed-loop living: crews practice recycling water, rationing energy and growing food — skills for disaster shelters and sustainable homes.',
            st: [['Mission', '2 weeks'], ['Crew', '6'], ['Analog', 'Mars geology'], ['Habitat', 'Hab + Greenhouse']]
        },
        {
            id: 'riotinto',
            n: 'Río Tinto',
            c: 'Andalusia, Spain',
            lat: 37.7,
            lon: -6.55,
            t: 'mars',
            mars: 'gale',
            s: 'A blood-red acidic river rich in iron and sulfate minerals, matching minerals Mars rovers found. Microbes thrive in it.',
            p: 'Bioremediation of toxic mining waste and bio-mining of metals. Lessons here clean polluted rivers worldwide.',
            st: [['pH', '~2.3'], ['Colour', 'Iron red'], ['Analog', 'Mars minerals'], ['Life', 'Extremophiles']]
        },
        {
            id: 'danakil',
            n: 'Danakil Depression',
            c: 'Ethiopia',
            lat: 14.2,
            lon: 40.3,
            t: 'mars',
            mars: 'hellas',
            s: 'One of the hottest, lowest places on Earth — acid pools, salt flats and volcanic heat. Used to study life limits and early-Mars hydrothermal systems.',
            p: 'Heat-resilient shelters and brine/mineral resource studies support extreme-heat adaptation in a warming world.',
            st: [['Temp', 'Up to 50 °C'], ['Depth', '−125 m'], ['Analog', 'Hydrothermal Mars'], ['pH', '< 1 pools']]
        },
        {
            id: 'askja',
            n: 'Askja Caldera',
            c: 'Iceland',
            lat: 65.05,
            lon: -16.75,
            t: 'moon',
            moon: 'tranq',
            s: 'In 1967 Apollo astronauts, including Neil Armstrong, trained here on ash and basalt fields that resemble lunar terrain.',
            p: 'Iceland’s geothermal expertise gives near-zero-carbon power and heat. Techniques for working on volcanic ground are shared for energy projects.',
            st: [['Trained', '1967 Apollo'], ['Terrain', 'Basalt + ash'], ['Power', 'Geothermal'], ['Analog', 'Lunar regolith']]
        },
        {
            id: 'craters',
            n: 'Craters of the Moon',
            c: 'Idaho, USA',
            lat: 43.2,
            lon: -113.5,
            t: 'moon',
            moon: 'marius',
            s: 'A lava-tube and cinder-cone landscape. Apollo 14 astronauts trained here and it is a model for exploring lunar lava tubes as shelter.',
            p: 'Lava tubes and underground spaces give constant temperatures — a model for low-energy shelter from radiation, heat and storms.',
            st: [['Trained', 'Apollo 14'], ['Analog', 'Lava tubes'], ['Area', '1,100 km²'], ['Shelter', 'Passive']]
        },
        {
            id: 'meteor',
            n: 'Meteor (Barringer) Crater',
            c: 'Arizona, USA',
            lat: 35.03,
            lon: -111.02,
            t: 'moon',
            moon: 'shackleton',
            s: 'A 1.2 km crater ~50,000 years old, where Apollo astronauts learned impact geology and crater-rim sampling.',
            p: 'Impact-hazard science and planetary geology training improve asteroid-risk modeling and field-geology education.',
            st: [['Width', '1.2 km'], ['Age', '~50,000 yr'], ['Analog', 'Impact crater'], ['Trained', 'Apollo']]
        },
        {
            id: 'lanzarote',
            n: 'Timanfaya, Lanzarote',
            c: 'Canary Islands, Spain',
            lat: 29.0,
            lon: -13.7,
            t: 'both',
            moon: 'tranq',
            mars: 'jezero',
            s: 'Black volcanic fields used by ESA and NASA for rover trials, geology training and sampling. Beside it, farmers grow grapes in black ash.',
            p: 'La Geria farmers grow crops in volcanic ash with almost no rain, using stone-wall pits — a template for low-water agriculture.',
            st: [['Terrain', 'Volcanic ash'], ['Rain', '~150 mm/yr'], ['Analog', 'Moon & Mars'], ['Used by', 'ESA, NASA']]
        },
        {
            id: 'uyuni',
            n: 'Salar de Uyuni',
            c: 'Bolivia',
            lat: -20.1,
            lon: -67.5,
            t: 'mars',
            mars: 'jezero',
            s: 'The world’s largest salt flat, a dried-up lake. Mimics ancient Martian lakebeds and is used for rover calibration.',
            p: 'Holds about half the world’s known lithium for batteries. Responsible-extraction science links space exploration to clean-energy supply.',
            st: [['Area', '10,000 km²'], ['Altitude', '3,656 m'], ['Analog', 'Dry lakebed'], ['Resource', 'Lithium']]
        }
    ],

    moon: [
        {
            id: 'shackleton',
            n: 'Shackleton Crater Rim',
            c: 'Lunar South Pole',
            lat: -89.5,
            lon: 0,
            t: 'moon',
            s: 'A permanently shadowed crater beside peaks of near-constant sunlight. It likely holds water ice — the prime Artemis target for a permanent base.',
            p: 'Ice = drinking water, oxygen and rocket fuel. Learning to find and extract it in the cold teaches us to use scarce resources wisely.',
            st: [['Depth', '4.2 km'], ['Shadow temp', '−240 °C'], ['Sunlight', 'Near-constant on rim'], ['Goal', 'Water ice']]
        },
        {
            id: 'malapert',
            n: 'Malapert Massif',
            c: 'Near South Pole',
            lat: -86,
            lon: 0.0,
            t: 'moon',
            s: 'A mountain with line-of-sight to Earth and long sunlight periods — ideal for a communications relay and solar power.',
            p: 'A model for solar-plus-comms in remote places that lack both grid and network.',
            st: [['Height', '~5 km'], ['Earth view', 'Yes'], ['Sunlight', '~80% of time'], ['Goal', 'Comms + power']]
        },
        {
            id: 'marius',
            n: 'Marius Hills Pit',
            c: 'Oceanus Procellarum',
            lat: 14.1,
            lon: -56.8,
            t: 'moon',
            s: 'A skylight into a collapsed lava tube. Natural caves could shield crews from radiation and temperature swings.',
            p: 'Natural shelter reduces the energy needed to survive extreme weather and radiation — a resilient-housing blueprint.',
            st: [['Feature', 'Lava tube skylight'], ['Width', '~50 m pit'], ['Shield', 'Radiation'], ['Temp', 'Stable']]
        },
        {
            id: 'tranq',
            n: 'Mare Tranquillitatis Pit',
            c: 'Sea of Tranquility',
            lat: 8.3,
            lon: 33.2,
            t: 'moon',
            s: 'A 100 m-deep pit in the basaltic plain next to Apollo 11’s landing site — evidence of a large cave beneath the surface.',
            p: 'Subsurface mapping with radar proves how to find caves and voids, also used for mine safety and archaeology on Earth.',
            st: [['Depth', '~100 m'], ['Terrain', 'Basalt'], ['Near', 'Apollo 11'], ['Goal', 'Cave habitat']]
        }
    ],

    mars: [
        {
            id: 'jezero',
            n: 'Jezero Crater',
            c: 'Mars · Perseverance',
            lat: 18.4,
            lon: 77.5,
            t: 'mars',
            s: 'An ancient river delta and lake where Perseverance is collecting rock cores that may hold signs of past life and will return to Earth.',
            p: 'MOXIE here makes oxygen from CO₂ — the same electrolysis ideas inform carbon-capture and clean-air technology.',
            st: [['Diameter', '45 km'], ['Rover', 'Perseverance'], ['Goal', 'Past life'], ['MOXIE', 'O₂ from CO₂']]
        },
        {
            id: 'gale',
            n: 'Gale Crater',
            c: 'Mars · Curiosity',
            lat: -5.4,
            lon: 137.8,
            t: 'mars',
            s: 'Home of Mount Sharp. Curiosity found clay minerals and organic molecules, proving Mars once had habitable conditions.',
            p: 'Mineral and soil analysis tools miniaturized for Mars are used for fast field soil testing by farmers on Earth.',
            st: [['Diameter', '154 km'], ['Mount Sharp', '5.5 km'], ['Rover', 'Curiosity'], ['Found', 'Organics']]
        },
        {
            id: 'utopia',
            n: 'Utopia Planitia',
            c: 'Mars · Northern Plains',
            lat: 46.7,
            lon: 117.5,
            t: 'mars',
            s: 'A huge plain with abundant shallow ice, a leading candidate region for future human landings that need water.',
            p: 'Ice mapping and drilling inform water and permafrost management for northern communities facing thaw.',
            st: [['Ice depth', '~1–10 m'], ['Latitude', '47° N'], ['Goal', 'Water access'], ['Solar', 'Moderate']]
        },
        {
            id: 'hellas',
            n: 'Hellas Planitia',
            c: 'Mars · Southern Basin',
            lat: -42,
            lon: 70,
            t: 'mars',
            s: 'The deepest basin on Mars, ~7 km below the datum. Thicker atmosphere there means higher pressure and warmer temperatures.',
            p: 'Understanding how low, hot basins behave helps design shelters and cooling for low-elevation heat zones on Earth.',
            st: [['Depth', '7 km'], ['Width', '2,300 km'], ['Pressure', 'Highest on Mars'], ['Goal', 'Warmer site']]
        }
    ]
};
