import { CustomForm, Form, FormButton, FormDropdown, FormLabel, SimpleForm } from "bdsx/bds/form";
import { ServerPlayer } from "bdsx/bds/player";
import { command } from "bdsx/command";
import { bedrockServer } from "bdsx/launcher";
import { log2console, plugin2console } from "./utlis";


plugin2console({
    name: 'Admin Panel',
    version: [1, 0, 0],
    author: 'BuraQ33'
})


command.register('panel', 'Admin panel').overload(async (param, origin, output) => {
    const actor = origin.getEntity();
    if (!actor?.isPlayer()) {
        console.log("it's the command for players");
        return;
    }
    const ni = actor.getNetworkIdentifier();

    const myFroms = {
        menu: (): SimpleForm => {
            const f = new SimpleForm('Admin Panel', '', [
                {
                    text: 'Players',
                    image: {
                        type: "path",
                        data: './admin_panel/img/barrier.webp'
                    }
                },
                {
                    text: 'Settings',
                    image: {
                        type: "path",
                        data: './admin_panel/img/barrier.webp'
                    }
                },
                {
                    text: 'Exit',
                    image: {
                        type: "path",
                        data: './admin_panel/img/barrier.webp'
                    }
                },
            ])
            return f;
        },
        mainMenu: {
            type: 'form',
            title: 'Admin Menu',
            content: '',
            buttons: [
                {
                    text: 'Players',
                    image: {
                        type: "path",
                        data: './admin_panel/img/barrier.webp'
                    }
                },
                {
                    text: 'Settings',
                    image: {
                        type: "path",
                        data: './admin_panel/img/barrier.webp'
                    }
                },
                {
                    text: 'Exit',
                    image: {
                        type: "path",
                        data: './admin_panel/img/barrier.webp'
                    }
                },
            ]
        },
        players: (): CustomForm => {
            const f = new CustomForm('Players')
            const activePlayers = bedrockServer.serverInstance.getPlayers()
            let plArr: string[] = [];
            activePlayers.forEach((pl) => plArr.push(pl.getName()))
            console.log(activePlayers)
            f.addComponent(new FormLabel(''))
            f.addComponent(new FormLabel(''))
            f.addComponent(new FormLabel('Wybierz Gracza'))
            f.addComponent(new FormDropdown('', plArr))
            return f
        },
    }


    const mainMenu = await myFroms.menu().sendTo(ni, (fd, ni) => {
        log2console(fd, 'menu main fd')
    });
    log2console(mainMenu)
    switch (mainMenu) {
        case null:
            return;
        case 0:
            const menuPlayers = await myFroms.players().sendTo(ni, (fd, ni) => {
                log2console(fd, 'menu player fd')
            })
            log2console(menuPlayers)
            break;
        case 1:
            break;
        case 2:
            break;
    }
    log2console(mainMenu)
}, {});
