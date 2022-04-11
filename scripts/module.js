Hooks.once('init', async function () {
    libWrapper.register('shy-effect-icons', 'Token.prototype.drawEffects', drawEffects, 'OVERRIDE')
    game.settings.register("shy-effect-icons", "permLevel", {
        name: 'Permission Level',
        hint: "Minimum permission level required to see an active effect",
        scope: 'world',
        type: String,
        choices: {
            "NONE" : "None",
            "LIMITED" : "Limited",
            "OBSERVER" : "Observer",
            "OWNER" : "Owner"
        },
        default: "None",
        config: true,
    });
})

async function drawEffects() {
    this.hud.effects.removeChildren().forEach(c => c.destroy());
    const tokenEffects = this.data.effects;
    const actorEffects = this.actor?.temporaryEffects || [];
    let overlay = {
      src: this.data.overlayEffect,
      tint: null
    };
    let minPerm = game.settings.get("shy-effect-icons", "permLevel")
    // Draw status effects
    if ( tokenEffects.length || actorEffects.length ) {
      const promises = [];
      let w = Math.round(canvas.dimensions.size / 2 / 5) * 2;
      let bg = this.hud.effects.addChild(new PIXI.Graphics()).beginFill(0x000000, 0.40).lineStyle(1.0, 0x000000);
      let i = 0;

      // Draw actor effects first
      for ( let f of actorEffects ) {
        if ( !f.data.icon ) continue;
        let source = await fromUuid(f.data.origin)
        if ( !source.testUserPermission(game.user, minPerm)) continue;
        const tint = f.data.tint ? foundry.utils.colorStringToHex(f.data.tint) : null;
        if ( f.getFlag("core", "overlay") ) {
          overlay = {src: f.data.icon, tint};
          continue;
        }
        promises.push(this._drawEffect(f.data.icon, i, bg, w, tint));
        i++;
      }

      // Next draw token effects
      for ( let f of tokenEffects ) {
        promises.push(this._drawEffect(f, i, bg, w, null));
        i++;
      }
      await Promise.all(promises);
    }

    // Draw overlay effect
    return this._drawOverlay(overlay)
  }