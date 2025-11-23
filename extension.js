import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import { UnlockDialog } from "resource:///org/gnome/shell/ui/unlockDialog.js";

export default class DisableLockScreenMediaExtension extends Extension {
    enable() {
        const proto = UnlockDialog.prototype;

        // Save original _init in a closure
        const originalInit = proto._init;
        this._originalInit = originalInit;

        proto._init = function (...args) {
            // Call the original _init
            originalInit.apply(this, args);

            // Patch the notifications box instance
            const nb = this._notificationsBox;
            if (nb) {
                if (nb._mediaSource) {
                    nb._mediaSource.disconnectObject(nb);
                    nb._mediaSource = null;
                }

                if (nb._players) {
                    for (const player of nb._players.keys()) {
                        nb._removePlayer(player);
                    }
                    nb._players.clear();
                }

                nb._addPlayer = function () {}; // block future additions
            }
        };
    }

    disable() {
        if (this._originalInit) {
            // Restore the original UnlockDialog._init
            UnlockDialog.prototype._init = this._originalInit;
            this._originalInit = null;
        }
    }
}

