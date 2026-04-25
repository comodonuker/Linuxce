// Helper to scan and replace bytes at all found addresses
async function AOBRep(search, change) {
    log("Scanning for patch: " + search);
    try {
        const results = await memory.AOB(search);
        if (results.length > 0) {
            let successCount = 0;
            for (let addr of results) {
                // Using type 7 (AOB Pattern) for patching
                if (memory.write(addr, change, 7)) {
                    successCount++;
                }
            }
            log("Successfully patched " + successCount + "/" + results.length + " locations.");
        } else {
            log("Patch failed: Pattern not found.");
        }
    } catch (e) {
        log("Error during AOBRep: " + e);
    }
}

// Little Endian Hex Helper
function to_le_hex(n) {
    let bytes = [];
    for (let i = 0; i < 4; i++) {
        bytes.push(((n >> (i * 8)) & 0xFF).toString(16).padStart(2, '0').toUpperCase());
    }
    return bytes.join(" ");
}

// Gravity Functions
const Gravities = {
    Default: 'C3 F5 1C C1 00 00 00 00 0A D7',
    Down:    '00 40 1C C6 00 00 00 00 0A D7',
    Up:      '00 40 1C 46 00 00 00 00 0A D7',
    Low:     '00 00 00 C0 00 00 00 00 0A D7'
}
var Grav_Address = 0;
function grvUp()
{
    if (Grav_Address != 0) {
        memory.write(Grav_Address, Gravities.Up, 7);
    } else {
        log("Addresses are not yet initialized.")
    }
}
function grvDown()
{
    if (Grav_Address != 0) {
        memory.write(Grav_Address, Gravities.Down, 7);
    } else {
        log("Addresses are not yet initialized.")
    }
}
function grvLow()
{
    if (Grav_Address != 0) {
        memory.write(Grav_Address, Gravities.Low, 7);
    } else {
        log("Addresses are not yet initialized.")
    }
}

function grvRestore() {
    if (Grav_Address != 0) {
        memory.write(Grav_Address, Gravities.Default, 7);
    } else {
        log("Addresses are not yet initialized.")
    }
}

// Item/Weapon Functions

const Prefabs = {
    ShareCamera:              '00 00 00 5B 53 68 61 72 65 43 61 6D 65 72 61 5D 00',
    FeedbackTool:             '00 00 00 5B 46 65 65 64 62 61 63 6B 54 6F 6F 6C 5D 00',
    Railgun:                  '00 00 00 5B 41 72 65 6E 61 5F 52 61 69 6C 47 75 6E 5D 00',
    ArenaShotgun:             '00 00 00 5B 41 72 65 6E 61 5F 53 68 6F 74 67 75 6E 5D 00',
    PaintballShotgun:         '00 00 00 5B 50 61 69 6E 74 62 61 6C 6C 53 68 6F 74 67 75 6E 5D 00',
    PaintballSniper:          '00 00 00 5B 50 61 69 6E 74 62 61 6C 6C 52 69 66 6C 65 53 63 6F 70 65 64 5D 00',
    PaintThrower:             '00 00 00 5B 50 61 69 6E 74 62 61 6C 6C 5F 50 61 69 6E 74 54 68 72 6F 77 65 72 5D 00',
    PaintballGrenadeLauncher: '00 00 00 5B 50 61 69 6E 74 62 61 6C 6C 47 72 65 6E 61 64 65 4C 61 75 6E 63 68 65 72 5D 00',
    UnitCube:                 '00 00 00 5B 53 74 61 63 6B 61 62 6C 65 42 6C 6F 63 6B 5D 00',
    Microphone:               '00 00 00 5B 4D 69 63 72 6F 70 68 6F 6E 65 5D 00',
    Speaker:                  '00 00 00 5B 53 61 6E 64 62 6F 78 5F 53 70 65 61 6B 65 72 5D 00',
    Bow:                      '00 00 00 5B 4C 6F 6E 67 62 6F 77 5D 00',
    RCCarSet:                 '00 00 00 5B 52 43 43 61 72 53 61 6E 64 62 6F 78 53 65 74 5D 00'
}

var Backpack_Addresses ={
    ShareCamera:  0,
    FeedbackTool: 0
}

async function PopulateBackpack() {
    const camres = await memory.AOB(Prefabs.ShareCamera);
    if (camres.length > 0) Backpack_Addresses.ShareCamera = camres[0];

    const clipres = await memory.AOB(Prefabs.FeedbackTool);
    if (clipres.length > 0) Backpack_Addresses.FeedbackTool = clipres[0];
    
    log("Backpack populated.");
}

async function PopulateWorld() {
    const gravres = await memory.AOB(Gravities.Default);
    if (gravres.length > 0) Grav_Address = gravres[0];
}

function rapidFire()       { AOBRep('33 33 D3 3F 00 00 00 00 00 00', '00 3C 1C 46 00 00 00 00 00 00'); }

function set_ammo(ammo_count) {
    const search = '4A ?? 00 00 00 06 00 00 00';
    if (ammo_count !== undefined) {
        AOBRep(search, "4A " + to_le_hex(ammo_count) + " 06 00 00 00");
    } else {
        AOBRep(search, '4A FF E0 F5 05 06 00 00 00');
    }
}

function onUpdate() { }

var showGravityCtrls = false;
var showShareCamera  = false;
var showFeedbackTool = false;
var showCombatHacks  = false;

function onGUI() {
    showGravityCtrls = gui.checkbox("Show Gravity Controls",     showGravityCtrls);
    showShareCamera  = gui.checkbox("Show ShareCamera Swapper",  showShareCamera);
    showFeedbackTool = gui.checkbox("Show FeedbackTool Swapper", showFeedbackTool);
    showCombatHacks  = gui.checkbox("Show Combat Hacks",         showCombatHacks);

    gui.separator();
    gui.text("Initialization");
    if (gui.button("Populate Backpack Addresses"))
    {
        PopulateBackpack();
    }
    if (gui.button("Populate World Addresses"))
    {
        PopulateWorld();
    }

    if (showGravityCtrls) {
        if (gui.beginWindow("Gravity Controls (0x" + Grav_Address.toString(16) + ")")) {
            gui.text("Gravity Controls");
            if (gui.button("Grav Up")) grvUp();
            gui.sameLine();
            if (gui.button("Grav Down")) grvDown();

            if (gui.button("Moon Grav")) grvLow();
            gui.sameLine();
            if (gui.button("Restore Grav")) grvRestore();
            gui.endWindow();
        }
    }

    if (showShareCamera) {
        if (gui.beginWindow("Replace ShareCamera")) {
            gui.text("ShareCamera (0x" + Backpack_Addresses.ShareCamera.toString(16) + ")");
            for (const [k, v] of Object.entries(Prefabs)) {
                if (gui.button("Cam -> " + k)) {
                    if (Backpack_Addresses.ShareCamera != 0) {
                        memory.write(Backpack_Addresses.ShareCamera, v, 7);
                    } else {
                        log("Error: ShareCamera address not found.");
                    }
                }
            }
            gui.endWindow();
        }
    }

    if (showFeedbackTool) {
        if (gui.beginWindow("Replace FeedbackTool")) {
            gui.text("FeedbackTool (0x" + Backpack_Addresses.FeedbackTool.toString(16) + ")");
            for (const [k, v] of Object.entries(Prefabs)) {
                if (gui.button("Clip -> " + k)) {
                    if (Backpack_Addresses.FeedbackTool != 0) {
                        memory.write(Backpack_Addresses.FeedbackTool, v, 7);
                    } else {
                        log("Error: FeedbackTool address not found.");
                    }
                }
            }
            gui.endWindow();
        }
    }

    if (showCombatHacks) {
        if (gui.beginWindow("Combat")) {
            if (gui.button("Infinite Ammo")) set_ammo();
            gui.sameLine();
            if (gui.button("Rapid Fire")) rapidFire();
            gui.endWindow();
        }
    }

    if (memory.isScanning()) {
        gui.separator();
        gui.text("Memory Scan: " + (memory.getProgress() * 100).toFixed(1) + "%");
        gui.progressBar(memory.getProgress());
    }
}
