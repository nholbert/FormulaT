// lib/game/entities/player.js
ig.baked = true;
ig.module('game.entities.player').requires('impact.entity').defines(function () {
    EntityPlayer = ig.Entity.extend({
        size: {
            x: 32,
            y: 48
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 700,
            y: 1000
        },
        friction: {
            x: 500,
            y: 0
        },
        type: ig.Entity.TYPE.A,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.PASSIVE,
        animSheet: new ig.AnimationSheet('media/player-body.png', 32, 48),
        flip: false,
        accelGround: 600,
        accelAir: 300,
        jump: 500,
        bounciness: 0,
        health: 240,
        inithealth: 240,
        flip: false,
        hurttimer: null,
        hurtspacing: .1,
        Playerloopcount: new ig.Timer(),
        Playerattacktimer: new ig.Timer(),
        zIndex: 1,
        landtimer: new ig.Timer(.2),
        falling: false,
        jetpackenable: new ig.Timer(2),
        freezetimer: new ig.Timer(2),
        weaponenable: new ig.Timer(2),
        infiniteammo: new ig.Timer(0),
        healing: new ig.Timer(0),
        name: 'player',
        toggle: false,
        firingtimer: new ig.Timer(.1),
        teleporttimer: new ig.Timer(1),
        gravityfliptimer: new ig.Timer(0),
        gravityflipped: false,
        breadcrumbemit: new ig.Timer(.02),
        movingtimer: null,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.zIndex = 1;
            this.addAnim('idle', 1, [0]);
            this.addAnim('run', 0.1, [1, 2, 3, 4]);
            this.addAnim('jump', .1, [5]);
            this.addAnim('fall1', 0.2, [6]);
            this.addAnim('fall2', 0.2, [6]);
            this.addAnim('attack', .3, [0], [1]);
            this.addAnim('init', .2, [0], [1]);
            this.addAnim('land', .2, [7]);
            this.addAnim('taunt', .2, [0]);
            this.vel.x = 0;
            this.vel.y = 0;
            this.hurttimer = new ig.Timer(this.hurtspacing);
            playersaveposx = this.pos.x;
            playersaveposy = this.pos.y;
            this.Playerloopcount = new ig.Timer(.4);
            this.Playerattacktimer = new ig.Timer(.15);
            this.weaponenable.set(0);
            this.teleporttimer.set(0);
            this.firingtimer.set(0);
            this.gravityfliptimer.set(0);
            this.gravityflipped = false;
            this.movingtimer = new ig.Timer(1);
        },
        update: function () {
            if (this.breadcrumbemit.delta() > 0) {
                var Angle = Math.atan2(this.vel.y, this.vel.x);
                var x = 17 * Math.cos(Angle + Math.PI);
                var y = 17 * Math.sin(Angle + Math.PI);
                var speed = "";
                if (Math.abs(this.vel.x) >= this.maxVel.x * .9 || Math.abs(this.vel.y) >= this.maxVel.y * .9) {
                    speed = "fast";
                } else {
                    if (Math.abs(this.vel.x) >= this.maxVel.x * .5 || Math.abs(this.vel.y) >= this.maxVel.y * .5) {
                        speed = "med";
                    } else {
                        speed = "slow";
                    }
                }
                ig.game.spawnEntity(EntityPlayerBreadcrumb, (this.pos.x + this.size.x / 2 - 15) + x, (this.pos.y + this.size.y / 2 - 15) + y, {
                    speed: speed
                });
                this.breadcrumbemit.reset();
            }
            if (this.gravityfliptimer.delta() < 0) {
                if (!this.gravityflipped) {
                    ig.game.gravity = -ig.game.gravity;
                    this.gravityflipped = true;
                }
            } else {
                if (this.gravityflipped) {
                    ig.game.gravity = -ig.game.gravity;
                    this.gravityflipped = false;
                }
            }
            if (Math.abs(this.vel.x) < this.maxVel.x * .9) {
                this.gravityfliptimer.set(0);
            }
            if (ig.game.gravity < 0) {
                if ((ig.game.collisionMap.getTile(this.pos.x + (this.size.x / 2), this.pos.y + this.size.y + 10)) || (!ig.game.collisionMap.getTile(this.pos.x + (this.size.x / 2), this.pos.y - 10))) {
                    this.gravityfliptimer.set(0);
                }
            }
            if (ig.game.gravity > 0) {
                if ((!ig.game.collisionMap.getTile(this.pos.x + (this.size.x / 2), this.pos.y + this.size.y + 10)) || (ig.game.collisionMap.getTile(this.pos.x + (this.size.x / 2), this.pos.y - 10))) {
                    this.gravityfliptimer.set(0);
                }
            }
            if (ig.game.gravity < 0) {
                this.anims.idle.flip.y = true;
                this.anims.run.flip.y = true;
                this.anims.jump.flip.y = true;
                this.anims.fall1.flip.y = true;
                this.anims.fall2.flip.y = true;
                this.anims.attack.flip.y = true;
                this.anims.init.flip.y = true;
                this.anims.land.flip.y = true;
                this.anims.taunt.flip.y = true;
            } else {
                this.anims.idle.flip.y = false;
                this.anims.run.flip.y = false;
                this.anims.jump.flip.y = false;
                this.anims.fall1.flip.y = false;
                this.anims.fall2.flip.y = false;
                this.anims.attack.flip.y = false;
                this.anims.init.flip.y = false;
                this.anims.land.flip.y = false;
                this.anims.taunt.flip.y = false;
            }
            if (this.teleporttimer.delta() < 0) {
                this.currentAnim = this.anims.idle;
                this.currentAnim.alpha = -this.teleporttimer.delta();
                this.vel.x = 0;
                this.vel.y = 0;
                this.accel.x = 0;
                this.accel.y = 0;
                this.gravityFactor = 0;
                ig.game.playerrunning = false;
            } else {
                this.currentAnim.alpha = 1;
                this.gravityFactor = 1;
                if (this.Playerloopcount.delta() < 0) {
                    this.vel.x = 0;
                    this.currentAnim = this.anims.init;
                    this.parent();
                    head = ig.game.getEntityByName('head');
                    if (!head) {
                        ig.game.spawnEntity(EntityPlayerHead, this.pos.x, this.pos.y);
                    }
                    arm = ig.game.getEntityByName('arm');
                    if (!arm) {
                        ig.game.spawnEntity(EntityPlayerArm, this.pos.x, this.pos.y);
                    }
                    maxvel = ig.game.getEntityByName('maxvel');
                    if (!maxvel) {
                        ig.game.spawnEntity(EntityPlayerMaxvel, this.pos.x + this.size.x / 2 - 120, this.pos.y + this.size.y / 2 - 120);
                    }
                } else {
                    var accel = this.standing ? this.accelGround : this.accelAir;
                    if (ig.input.state('left')) {
                        this.accel.x = -accel;
                        this.flip = true;
                    } else if (ig.input.state('right')) {
                        this.accel.x = accel;
                        this.flip = false;
                    } else {
                        this.accel.x = 0;
                    }
                    if (ig.input.pressed('jump') && this.standing) {
                        if (ig.game.gravity < 0) {
                            this.vel.y = this.jump;
                        } else {
                            this.vel.y = -this.jump;
                        }
                    }
                    if (this.standing && this.landtimer.delta() < 0) {
                        this.currentAnim = this.anims.land;
                        this.currentAnim.flip.x = this.flip;
                        ig.game.playerrunning = false;
                    } else if (this.vel.y < 0 && !this.standing && ig.game.gravity > 0) {
                        this.currentAnim = this.anims.jump;
                        ig.game.playerrunning = false;
                    } else if (this.vel.y > 0 && !this.standing && ig.game.gravity < 0) {
                        this.currentAnim = this.anims.jump;
                        ig.game.playerrunning = false;
                    } else if (this.vel.y > 0 && this.vel.y < 100 && !this.standing) {
                        this.falling = true;
                        this.currentAnim = this.anims.fall1;
                        ig.game.playerrunning = false;
                    } else if (this.vel.y > 100 && !this.standing && ig.game.gravity > 0) {
                        this.currentAnim = this.anims.fall2;
                        ig.game.playerrunning = false;
                    } else if (this.vel.y < -100 && !this.standing && ig.game.gravity < 0) {
                        this.currentAnim = this.anims.fall2;
                        ig.game.playerrunning = false;
                    } else if (Math.abs(this.vel.x) > 70) {
                        this.currentAnim = this.anims.run;
                        ig.game.playerrunning = true;
                    } else {
                        this.currentAnim = this.anims.idle;
                        ig.game.playerrunning = false;
                    }
                    if (this.standing && this.falling == true) {
                        this.landtimer.reset();
                        this.falling = false;
                    }
                    var mx = ig.input.mouse.x + ig.game.screen.x,
                        my = ig.input.mouse.y + ig.game.screen.y;
                    if (mx < this.pos.x) {
                        this.flip = true;
                    } else {
                        this.flip = false;
                    }
                    var mouseAngle = Math.atan2(my - (this.pos.y + this.size.y / 2), mx - (this.pos.x + this.size.x / 2));
                    if (this.flip) {
                        mouseAngle = mouseAngle - Math.PI;
                    }
                    this.currentAnim.flip.x = this.flip;
                    if (ig.input.state('shoot1')) {
                        if (this.Playerloopcount.delta() >= 0) {
                            if (this.Playerattacktimer.delta() >= 0) {
                                if (this.weaponenable.delta() > 0) {
                                    this.Playerattacktimer.reset();
                                    this.firingtimer.set(.1);
                                    if (ig.game.fxquality != "low") {
                                        ig.game.spawnEntity(EntityGunFlare, (this.flip ? this.pos.x : this.pos.x), (this.currentAnim.flip.y ? this.pos.y : this.pos.y - 16), {
                                            flip: this.flip,
                                            posx: this.pos.x,
                                            posy: this.pos.y,
                                            velx: this.vel.x,
                                            vely: this.vel.y,
                                            angle: mouseAngle
                                        });
                                        ig.game.spawnEntity(EntityCasing, (this.flip ? this.pos.x + this.size.x - 15 : this.pos.x + 15), (this.currentAnim.flip.y ? this.pos.y + 16 : this.pos.y + 32), {
                                            flip: this.flip,
                                            posx: this.pos.x,
                                            posy: this.pos.y,
                                            velx: this.vel.x,
                                            vely: this.vel.y,
                                            angle: mouseAngle
                                        });
                                    }
                                    var mouseAngle = Math.atan2(my - (this.pos.y + this.size.y / 2), mx - (this.pos.x + this.size.x / 2));
                                    var shotX = this.pos.x + this.size.x / 2 + (10 * Math.cos(mouseAngle) - 5);
                                    var shotY = this.pos.y + 22 + (16 * Math.sin(mouseAngle));
                                    ig.game.spawnEntity(EntityWeaponDefault, (this.flip ? shotX : shotX), shotY, {
                                        flip: this.flip,
                                        owner: 'player',
                                        angle: mouseAngle,
                                        velx: this.vel.x,
                                        vely: this.vel.y
                                    });
                                    if (ig.Sound.enabled) {
                                        ig.game.gunshot.play();
                                    }
                                }
                            }
                        }
                    }
                    if (this.vel.x == 0 && this.vel.y == 0) {
                        if (this.movingtimer.delta() >= 0) {
                            this.health -= 1;
                            ig.game.spawnEntity(Particle_Blue, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, {
                                flip: this.flip,
                                velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 2) : Math.floor(Math.random() * this.maxVel.x / 2)),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(Particle_Red, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, {
                                flip: this.flip,
                                velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 2) : Math.floor(Math.random() * this.maxVel.x / 2)),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(Particle_Yellow, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, {
                                flip: this.flip,
                                velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 2) : Math.floor(Math.random() * this.maxVel.x / 2)),
                                vely: Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(Particle_Orange, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, {
                                flip: this.flip,
                                velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 2) : Math.floor(Math.random() * this.maxVel.x / 2)),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            if (this.health <= 0) {
                                this.kill();
                            }
                        }
                    } else {
                        this.movingtimer.reset();
                    }
                }
            }
            this.parent();
        },
        kill: function () {
            var time = ig.game.getEntityByName('leveltime');
            time.playerspawntimer.reset();
            if (!ig.game.levelcomplete) {
                if (ig.Sound.enabled) {
                    ig.game.playerdie.play();
                }
            }
            var playerdeath = ig.game.getEntitiesByType(EntityPlayerdeath)[0];
            if (!playerdeath) {
                ig.game.spawnEntity(EntityPlayerdeath, this.pos.x, this.pos.y, {
                    flip: this.flip,
                    velx: this.vel.x,
                    vely: this.vel.y
                });
                ig.game.removeEntity(this);
                ig.game.removeEntity('maxvel');
            }
        },
        receiveDamage: function (amount, from, x, y) {
            if (this.Playerloopcount.delta() < 0) {
                from.kill();
            } else {
                if (!ig.game.levelcomplete) {
                    if (this.hurttimer.delta() > 0) {
                        this.hurttimer.reset();
                        if (!ig.game.godmode) {
                            this.health -= amount;
                        }
                        if (this.health <= 0) {
                            this.kill();
                        } else {
                            var count = ig.ua.mobile ? 1 : 1;
                            for (i = 0; i <= count; i++) {
                                ig.game.spawnEntity(Particle_Yellow, x, y, {
                                    flip: this.flip,
                                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                                });
                                ig.game.spawnEntity(Particle_Yellow, x, y, {
                                    flip: this.flip,
                                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                                });
                                ig.game.spawnEntity(Particle_Orange, x, y, {
                                    flip: this.flip,
                                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                                });
                                ig.game.spawnEntity(Particle_Orange, x, y, {
                                    flip: this.flip,
                                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                                });
                            }
                            count = ig.ua.mobile ? 0 : 0;
                            for (i = 0; i <= count; i++) {
                                ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                                    flip: this.flip,
                                    velx: -Math.floor(Math.random() * this.maxVel.x / 4),
                                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                                });
                                ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                                    flip: this.flip,
                                    velx: Math.floor(Math.random() * this.maxVel.x / 4),
                                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                                });
                            }
                        }
                    }
                }
            }
        },
        collideWith: function (other, axis) {
            if (other.collides == ig.Entity.COLLIDES.FIXED && this.touches(other)) {
                var overlap;
                var size;
                if (axis == 'y') {
                    size = this.size.y;
                    if (this.pos.y < other.pos.y) overlap = this.pos.y + this.size.y - other.pos.y;
                    else overlap = this.pos.y - (other.pos.y + other.size.y);
                } else {
                    size = this.size.x;
                    if (this.pos.x < other.pos.x) overlap = this.pos.x + this.size.x - other.pos.x;
                    else overlap = this.pos.x - (other.pos.x + other.size.x);
                }
                overlap = Math.abs(overlap);
                if (overlap > 1) {
                    this.kill();
                }
            }
        },
        handleMovementTrace: function (res) {
            COLLISION_TILE = 1;
            PLATFORM_TILE = 2;
            DANGEROUS_TILE = 3;
            if (res.tile.x == DANGEROUS_TILE || res.tile.y == DANGEROUS_TILE) {
                this.kill();
                if (res.tile.x != 1 && res.tile.y != 1) {
                    res.collision.x = false;
                    res.collision.y = false;
                    res.pos.x = this.pos.x + this.vel.x * ig.system.tick;
                    res.pos.y = this.pos.y + this.vel.y * ig.system.tick;
                }
            }
            if (res.tile.x == PLATFORM_TILE) {
                res.collision.x = false;
                res.pos.x = this.pos.x + this.vel.x * ig.system.tick;
            }
            if (ig.game.gravity > 0) {
                if (res.tile.y == PLATFORM_TILE && (this.vel.y < 0 || this.pos.y > res.pos.y)) {
                    res.collision.y = false;
                    res.pos.y = this.pos.y + this.vel.y * ig.system.tick;
                }
            }
            if (ig.game.gravity < 0) {
                if (res.tile.y == PLATFORM_TILE && (this.vel.y > 0 || this.pos.y < res.pos.y)) {
                    res.collision.y = false;
                    res.pos.y = this.pos.y + this.vel.y * ig.system.tick;
                }
            }
            if (ig.game.gravity > 0) {
                if ((res.tile.y == COLLISION_TILE) && (Math.abs(this.vel.x) >= this.maxVel.x * .9) && (!ig.game.collisionMap.getTile(this.pos.x + (this.size.x / 2), this.pos.y + this.size.y + 10)) && (ig.game.collisionMap.getTile(this.pos.x + (this.size.x / 2), this.pos.y - 10))) {
                    if (this.gravityfliptimer.delta() >= 0) {
                        if (!this.gravityflipped) {
                            this.gravityfliptimer.set(.5);
                        }
                    }
                }
            }
            if (ig.game.gravity < 0) {
                if ((res.tile.y == COLLISION_TILE) && (Math.abs(this.vel.x) >= this.maxVel.x * .9) && (ig.game.collisionMap.getTile(this.pos.x + (this.size.x / 2), this.pos.y + this.size.y + 10)) && (!ig.game.collisionMap.getTile(this.pos.x + (this.size.x / 2), this.pos.y - 10))) {
                    if (this.gravityfliptimer.delta() >= 0) {
                        if (!this.gravityflipped) {
                            this.gravityfliptimer.set(.5);
                        }
                    }
                }
            }
            this.parent(res);
        }
    });
    EntityPlayerHead = ig.Entity.extend({
        size: {
            x: 32,
            y: 32
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 1000,
            y: 1000
        },
        bounciness: .5,
        type: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        player: null,
        name: 'head',
        animSheet: new ig.AnimationSheet('media/player-head.png', 32, 32),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('idle', 1, [0]);
            this.addAnim('run', 0.1, [1, 2, 3, 2]);
            this.addAnim('fire', 0.1, [4]);
            this.currentAnim = this.anims.idle;
            this.zIndex = 5;
            this.gravityFactor = 0;
        },
        update: function () {
            this.player = ig.game.getEntityByName('player');
            if (this.player) {
                if (this.player.teleporttimer.delta() < 0) {
                    this.currentAnim.alpha = -this.player.teleporttimer.delta();
                    this.currentAnim = this.anims.idle;
                    this.vel.x = 0;
                    this.vel.y = 0;
                    this.accel.x = 0;
                    this.accel.y = 0;
                } else {
                    if (this.player.firingtimer.delta() < 0) {
                        this.currentAnim = this.anims.fire;
                    } else {
                        if (ig.game.playerrunning) {
                            this.currentAnim = this.anims.run;
                        } else {
                            this.currentAnim = this.anims.idle;
                        }
                    }
                    this.currentAnim.alpha = 1;
                    this.flip = this.player.flip;
                    if (ig.game.gravity < 0) {
                        this.currentAnim.flip.y = true;
                    } else {
                        this.currentAnim.flip.y = false;
                    }
                    this.pos.x = this.player.pos.x + (this.player.flip ? 0 : 0);
                    if (this.player.landtimer.delta() < 0) {
                        if (ig.game.gravity < 0) {
                            this.pos.y = this.player.pos.y - 4 + 16;
                        } else {
                            this.pos.y = this.player.pos.y + 4;
                        }
                    } else {
                        if (ig.game.gravity < 0) {
                            this.pos.y = this.player.pos.y + 16;
                        } else {
                            this.pos.y = this.player.pos.y;
                        }
                    }
                    var mx = ig.input.mouse.x + ig.game.screen.x,
                        my = ig.input.mouse.y + ig.game.screen.y;
                    var mouseAngle = Math.atan2(my - (this.pos.y + this.size.y / 2), mx - (this.pos.x + this.size.x / 2));
                    if ((!this.flip && mx >= this.pos.x)) {
                        this.currentAnim.angle = mouseAngle;
                    } else if ((this.flip && mx <= this.pos.x + this.size.x)) {
                        this.currentAnim.angle = mouseAngle - Math.PI;
                    } else {
                        this.currentAnim.angle = 0;
                    }
                    this.currentAnim.flip.x = this.flip;
                }
            } else {
                this.kill();
            }
            this.parent();
        }
    });
    EntityPlayerArm = ig.Entity.extend({
        size: {
            x: 64,
            y: 64
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 1000,
            y: 1000
        },
        bounciness: .5,
        type: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        player: null,
        name: 'arm',
        animSheet: new ig.AnimationSheet('media/player-arm.png', 64, 64),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('fire', 1, [2]);
            this.addAnim('idle', 1, [0]);
            this.addAnim('run', .1, [0, 1]);
            this.currentAnim = this.anims.idle;
            this.zIndex = 6;
            this.gravityFactor = 0;
        },
        update: function () {
            this.player = ig.game.getEntityByName('player');
            if (this.player) {
                if (this.player.teleporttimer.delta() < 0) {
                    this.currentAnim.alpha = -this.player.teleporttimer.delta();
                    this.currentAnim = this.anims.idle;
                    this.vel.x = 0;
                    this.vel.y = 0;
                    this.accel.x = 0;
                    this.accel.y = 0;
                } else {
                    if (this.player.firingtimer.delta() < 0) {
                        this.currentAnim = this.anims.fire;
                    } else {
                        if (ig.game.playerrunning) {
                            this.currentAnim = this.anims.run;
                        } else {
                            this.currentAnim = this.anims.idle;
                        }
                    }
                    this.currentAnim.alpha = 1;
                    this.flip = this.player.flip;
                    if (ig.game.gravity < 0) {
                        this.currentAnim.flip.y = true;
                    } else {
                        this.currentAnim.flip.y = false;
                    }
                    this.pos.x = this.player.pos.x - this.size.x / 4;
                    if (this.player.landtimer.delta() < 0) {
                        if (ig.game.gravity < 0) {
                            this.pos.y = this.player.pos.y - 4 - 16;
                        } else {
                            this.pos.y = this.player.pos.y + 4;
                        }
                    } else {
                        if (ig.game.gravity < 0) {
                            this.pos.y = this.player.pos.y - 16;
                        } else {
                            this.pos.y = this.player.pos.y;
                        }
                    }
                    var mx = ig.input.mouse.x + ig.game.screen.x,
                        my = ig.input.mouse.y + ig.game.screen.y;
                    var mouseAngle = Math.atan2(my - (this.pos.y + this.size.y / 2), mx - (this.pos.x + this.size.x / 2));
                    if ((!this.flip && mx >= this.pos.x)) {
                        this.currentAnim.angle = mouseAngle;
                    } else if ((this.flip && mx <= this.pos.x + this.size.x)) {
                        this.currentAnim.angle = mouseAngle - Math.PI;
                    } else {
                        this.currentAnim.angle = 0;
                    }
                    this.currentAnim.flip.x = this.flip;
                }
            } else {
                this.kill();
            }
            this.parent();
        }
    });
    EntityPlayerMaxvel = ig.Entity.extend({
        size: {
            x: 240,
            y: 240
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 1000,
            y: 1000
        },
        bounciness: .5,
        type: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        player: null,
        name: 'maxvel',
        animSheet: new ig.AnimationSheet('media/effect-maxvel.png', 240, 240),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('slow', .1, [0]);
            this.addAnim('med', .1, [1]);
            this.addAnim('fast', .1, [2]);
            this.currentAnim = this.anims.idle;
            this.zIndex = 6;
            this.gravityFactor = 0;
        },
        update: function () {
            this.player = ig.game.getEntityByName('player');
            if (this.player) {
                this.pos.x = this.player.pos.x + this.player.size.x / 2 - 120;
                this.pos.y = this.player.pos.y + this.player.size.y / 2 - 120;
                if (this.player.teleporttimer.delta() < 0) {
                    this.currentAnim.alpha = 0;
                } else {
                    if (Math.abs(this.player.vel.x) >= this.player.maxVel.x * .9 || Math.abs(this.player.vel.y) >= this.player.maxVel.y * .9) {
                        this.currentAnim = this.anims.fast;
                        this.currentAnim.alpha = 1;
                    } else {
                        if (Math.abs(this.player.vel.x) >= this.player.maxVel.x * .5 || Math.abs(this.player.vel.y) >= this.player.maxVel.y * .5) {
                            this.currentAnim = this.anims.med;
                        } else {
                            this.currentAnim = this.anims.slow;
                        }
                        if (Math.abs(this.player.vel.x) / this.player.maxVel.x >= Math.abs(this.player.vel.y) / this.player.maxVel.y) {
                            this.currentAnim.alpha = (Math.abs(this.player.vel.x) / this.player.maxVel.x);
                        } else {
                            this.currentAnim.alpha = (Math.abs(this.player.vel.y) / this.player.maxVel.y);
                        }
                    }
                    var Angle = Math.atan2(this.player.vel.y, this.player.vel.x);
                    this.currentAnim.angle = Angle;
                }
            } else {
                this.kill();
            }
            this.parent();
        }
    });
    EntityPlayerdeath = ig.Entity.extend({
        size: {
            x: 32,
            y: 48
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 500,
            y: 500
        },
        bounciness: 0,
        lifetime: 3,
        fadetime: 1,
        type: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.PASSIVE,
        animSheet: new ig.AnimationSheet('media/player-body.png', 32, 48),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.zIndex = 5;
            this.vel.x = settings.velx / 10;
            this.vel.y = -(Math.random() * Math.abs(this.maxVel.x / 2));
            ig.game.spawnEntity(EntityPlayerDeadHead, this.pos.x + this.size.x / 2, this.pos.y, {
                flip: this.flip,
                velx: -settings.velx
            });
            ig.game.spawnEntity(EntityPlayerDeadArm, this.pos.x, this.pos.y, {
                flip: this.flip,
                velx: settings.velx
            });
            ig.game.spawnEntity(EntityPlayerGun, this.pos.x, this.pos.y, {
                flip: this.flip,
                velx: settings.velx
            });
            var count = ig.ua.mobile ? 2 : 10;
            for (i = 0; i <= count; i++) {
                ig.game.spawnEntity(Particle_Blue, this.pos.x + this.size.x / 2, this.pos.y - 1, {
                    flip: this.flip,
                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 2) : Math.floor(Math.random() * this.maxVel.x / 2)),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_Blue, this.pos.x + this.size.x / 2, this.pos.y - 1, {
                    flip: this.flip,
                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 2) : Math.floor(Math.random() * this.maxVel.x / 2)),
                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_Red, this.pos.x + this.size.x / 2, this.pos.y - 1, {
                    flip: this.flip,
                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 2) : Math.floor(Math.random() * this.maxVel.x / 2)),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_Red, this.pos.x + this.size.x / 2, this.pos.y - 1, {
                    flip: this.flip,
                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 2) : Math.floor(Math.random() * this.maxVel.x / 2)),
                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_Yellow, this.pos.x + this.size.x / 2, this.pos.y - 1, {
                    flip: this.flip,
                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 2) : Math.floor(Math.random() * this.maxVel.x / 2)),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_Yellow, this.pos.x + this.size.x / 2, this.pos.y - 1, {
                    flip: this.flip,
                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 2) : Math.floor(Math.random() * this.maxVel.x / 2)),
                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_Orange, this.pos.x + this.size.x / 2, this.pos.y - 1, {
                    flip: this.flip,
                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 2) : Math.floor(Math.random() * this.maxVel.x / 2)),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_Orange, this.pos.x + this.size.x / 2, this.pos.y - 1, {
                    flip: this.flip,
                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 2) : Math.floor(Math.random() * this.maxVel.x / 2)),
                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                });
            }
            for (i = 0; i <= 1; i++) {
                ig.game.spawnEntity(EntityPlayerDebris, this.pos.x + (this.flip ? 0 : this.size.x / 2), this.pos.y + this.size.y / 2, {
                    flip: this.flip,
                    velx: -Math.floor(Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(EntityPlayerDebris, this.pos.x + (this.flip ? 0 : this.size.x / 2), this.pos.y + this.size.y / 2, {
                    flip: this.flip,
                    velx: Math.floor(Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
            }
            ig.game.spawnEntity(ExplosionEffect, this.pos.x + this.size.x / 2 - 30, this.pos.y + (this.size.y / 2) - 30, {
                owner: this.owner
            });
            this.addAnim('die', .1, [8, 9, 8, 9, 8, 8, 8]);
            this.currentAnim = this.anims.die;
            if (ig.game.gravity < 0) {
                this.currentAnim.flip.y = true;
            } else {
                this.currentAnim.flip.y = false;
            }
            this.idleTimer = new ig.Timer();
        },
        handleMovementTrace: function (res) {
            this.parent(res);
            if (res.collision.x || res.collision.y) {
                this.vel.x = this.vel.x * .9;
                this.vel.y = this.vel.y * .9;
            }
        },
        update: function () {
            this.currentAnim.alpha = 1 - (this.idleTimer.delta() / this.lifetime);
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
                return;
            }
            this.currentAnim.alpha = 1 - (this.idleTimer.delta() / this.lifetime);
            this.parent();
        }
    });
    EntityPlayerDebris = ig.Entity.extend({
        size: {
            x: 5,
            y: 5
        },
        offset: {
            x: 5,
            y: 5
        },
        maxVel: {
            x: 400,
            y: 400
        },
        bounciness: 0.6,
        lifetime: 3,
        fadetime: 1,
        type: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.PASSIVE,
        animSheet: new ig.AnimationSheet('media/player-debris.png', 15, 15),
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            var entitycount = ig.game.getEntitiesByType(EntityPlayerDebris)[ig.game.entitylimit];
            if (entitycount) {
                this.kill();
            }
            this.zIndex = 5;
            this.vel.x = settings.velx;
            this.vel.y = -(Math.random() * Math.abs(this.maxVel.x));
            this.addAnim('idle', 10, [0, 1, 2, 3, 4]);
            this.currentAnim.gotoRandomFrame();
            this.currentAnim.flip.x = settings.flip;
            this.idleTimer = new ig.Timer();
        },
        handleMovementTrace: function (res) {
            this.parent(res);
            if (res.collision.x || res.collision.y) {
                this.vel.x = this.vel.x * .95;
                this.vel.y = this.vel.y * 1;
            }
        },
        update: function () {
            this.currentAnim.alpha = 1 - (this.idleTimer.delta() / this.lifetime);
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
                return;
            }
            this.currentAnim.alpha = 1 - (this.idleTimer.delta() / this.lifetime);
            this.parent();
        }
    });
    EntityPlayerDeadHead = ig.Entity.extend({
        size: {
            x: 32,
            y: 32
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 400,
            y: 400
        },
        bounciness: 0.6,
        lifetime: 3,
        fadetime: 1,
        type: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.PASSIVE,
        animSheet: new ig.AnimationSheet('media/player-head.png', 32, 32),
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.zIndex = 5;
            this.flip = settings.flip;
            this.vel.x = (settings.flip ? -Math.floor(Math.random() * this.maxVel.x / 2) : Math.floor(Math.random() * this.maxVel.x / 2));
            this.vel.y = -(Math.random() * Math.abs(this.maxVel.x));
            this.addAnim('idle', 0.2, [5]);
            this.currentAnim.flip.x = this.flip;
            this.idleTimer = new ig.Timer();
        },
        handleMovementTrace: function (res) {
            this.parent(res);
            if (res.collision.x || res.collision.y) {
                this.vel.x = this.vel.x * .95;
                this.vel.y = this.vel.y * 1;
            }
        },
        update: function () {
            if (Math.abs(this.vel.x) > 10) {
                this.currentAnim.angle = (this.flip ? -1 : 1) * 2 * (this.idleTimer.delta() / this.lifetime) * Math.PI;
            }
            this.currentAnim.alpha = 1 - (this.idleTimer.delta() / this.lifetime);
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
                return;
            }
            this.parent();
        }
    });
    EntityPlayerDeadArm = ig.Entity.extend({
        size: {
            x: 25,
            y: 12
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 400,
            y: 400
        },
        bounciness: 0.6,
        lifetime: 3,
        fadetime: 1,
        type: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.PASSIVE,
        animSheet: new ig.AnimationSheet('media/player-deadarm.png', 25, 12),
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.zIndex = 5;
            this.flip = !settings.flip;
            this.vel.x = (settings.flip ? Math.floor(Math.random() * this.maxVel.x / 2) : -Math.floor(Math.random() * this.maxVel.x / 2));
            this.vel.y = -(Math.random() * Math.abs(this.maxVel.x));
            this.addAnim('idle', 0.2, [0]);
            this.currentAnim.flip.x = this.flip;
            this.idleTimer = new ig.Timer();
        },
        handleMovementTrace: function (res) {
            this.parent(res);
            if (res.collision.x || res.collision.y) {
                this.vel.x = this.vel.x * .95;
                this.vel.y = this.vel.y * 1;
            }
        },
        update: function () {
            this.currentAnim.alpha = 1 - (this.idleTimer.delta() / this.lifetime);
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
                return;
            }
            this.parent();
        }
    });
    EntityPlayerGun = ig.Entity.extend({
        size: {
            x: 27,
            y: 27
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 400,
            y: 400
        },
        bounciness: 0.6,
        lifetime: 2,
        fadetime: 1,
        type: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.PASSIVE,
        fliptimer: null,
        rotatetimer: null,
        idleTimer: null,
        animSheet: new ig.AnimationSheet('media/player-gun.png', 27, 27),
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.zIndex = 5;
            this.flip = settings.flip;
            this.vel.x = (settings.flip ? -Math.floor(Math.random() * this.maxVel.x) : Math.floor(Math.random() * this.maxVel.x));
            this.vel.y = -(Math.random() * Math.abs(this.maxVel.x)) - 20;
            this.addAnim('idle', 0.2, [0]);
            this.currentAnim.flip.x = this.flip;
            this.idleTimer = new ig.Timer();
            this.fliptimer = new ig.Timer(.5);
            this.rotatetimer = new ig.Timer(3);
        },
        handleMovementTrace: function (res) {
            this.parent(res);
            if (res.collision.x || res.collision.y) {
                if (Math.abs(this.vel.x) > 50 && this.fliptimer.delta() > 0) {
                    this.flip = !this.flip;
                    this.fliptimer.reset;
                }
                this.vel.x = this.vel.x * .95;
                this.vel.y = this.vel.y * 1;
            }
        },
        update: function () {
            if (Math.abs(this.vel.x) > 50) {
                this.currentAnim.angle += (this.flip ? -1 : 1) * 1 / Math.PI;
            }
            this.currentAnim.alpha = 1 - (this.idleTimer.delta() / this.lifetime);
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
                return;
            }
            this.parent();
        }
    });
});

// lib/game/entities/weapons.js
ig.baked = true;
ig.module('game.entities.weapons').requires('impact.entity').defines(function () {
    EntityWeapons = ig.Entity.extend({
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 800,
            y: 800
        },
        lifetime: 5,
        fadetime: 1,
        damage: 10,
        gravityFactor: 0,
        owner: null,
        bounciness: 1,
        bounces: 3,
        type: ig.Entity.TYPE.A,
        checkAgainst: ig.Entity.TYPE.B,
        collides: ig.Entity.COLLIDES.PASSIVE,
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.owner = settings.owner;
            this.flip = settings.flip;
            this.vel.x = (this.maxVel.x) * Math.cos(settings.angle);
            this.vel.y = (this.maxVel.y) * Math.sin(settings.angle);
            this.addAnim('idle', 0.2, [0]);
            this.currentAnim.angle = settings.angle;
            this.idleTimer = new ig.Timer();
        },
        handleMovementTrace: function (res) {
            COLLISION_TILE = 1;
            PLATFORM_TILE = 2;
            DANGEROUS_TILE = 3;
            if ((res.tile.x == PLATFORM_TILE || res.tile.y == PLATFORM_TILE) && !(res.tile.x == COLLISION_TILE) && !(res.tile.y == COLLISION_TILE)) {
                res.collision.x = false;
                res.pos.x = this.pos.x + (this.vel.x * ig.system.tick) / 2;
                res.collision.y = false;
                res.pos.y = this.pos.y + (this.vel.y * ig.system.tick) / 2;
            }
            if (res.tile.x == PLATFORM_TILE && res.tile.y == PLATFORM_TILE) {
                this.kill();
            }
            if (res.collision.x || res.collision.y) {
                this.bounceCounter++;
                if (this.bounceCounter > 2) {
                    this.kill();
                }
            }
            this.parent(res);
        },
        collideWith: function (other, axis) {
            if (other.collides == ig.Entity.COLLIDES.FIXED && this.touches(other)) {
                this.kill();
            }
        },
        check: function (other) {
            if (other == ig.game.player) {
                if (this.owner == 'player') {} else {
                    other.receiveDamage(this.damage, this, this.pos.x, this.pos.y);
                }
            } else {
                if (this.owner == 'bot') {} else {
                    other.receiveDamage(this.damage, this, this.pos.x, this.pos.y);
                }
            }
            this.kill();
        },
        update: function () {
            if (ig.game.player) {
                if (this.distanceTo(ig.game.player) > ig.game.activedistance * 2) {
                    ig.game.removeEntity(this);
                }
            }
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
                this.currentAnim.alpha = this.idleTimer.delta().map(this.lifetime - this.fadetime, this.lifetime, 1, 0);
            }
            this.parent();
        }
    });
    EntityWeaponDefault = EntityWeapons.extend({
        size: {
            x: 10,
            y: 10
        },
        bounces: 0,
        damage: 10,
        name: 'bullet',
        animSheet: new ig.AnimationSheet('media/weapon-player.png', 10, 10),
        kill: function () {
            ig.game.removeEntity(this);
            var count = ig.ua.mobile ? 1 : 10;
            for (i = 0; i <= count; i++) {
                ig.game.spawnEntity(Particle_Blue, this.pos.x + (this.flip ? this.size.x - 2 : 0), this.pos.y + this.size.y / 2, {
                    flip: this.flip,
                    velx: (Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.x / 2)
                });
                ig.game.spawnEntity(Particle_Blue, this.pos.x + (this.flip ? this.size.x - 2 : 0), this.pos.y + this.size.y / 2, {
                    flip: this.flip,
                    velx: (Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.x / 2)
                });
                ig.game.spawnEntity(Particle_DarkBlue, this.pos.x + (this.flip ? this.size.x - 2 : 0), this.pos.y + this.size.y / 2, {
                    flip: this.flip,
                    velx: (Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.x / 2)
                });
                ig.game.spawnEntity(Particle_DarkBlue, this.pos.x + (this.flip ? this.size.x - 2 : 0), this.pos.y + this.size.y / 2, {
                    flip: this.flip,
                    velx: (Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.x / 2)
                });
            }
        }
    });
    EntityWeaponEnemy = EntityWeapons.extend({
        size: {
            x: 10,
            y: 10
        },
        bounces: 0,
        damage: 10,
        maxVel: {
            x: 300,
            y: 300
        },
        animSheet: new ig.AnimationSheet('media/weapon-enemy.png', 10, 10),
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        kill: function () {
            ig.game.removeEntity(this);
            var count = ig.ua.mobile ? 1 : 10;
            for (i = 0; i <= count; i++) {
                ig.game.spawnEntity(Particle_Red, this.pos.x + (this.flip ? this.size.x - 2 : 0), this.pos.y + this.size.y / 2, {
                    flip: this.flip,
                    velx: (Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.x / 2)
                });
                ig.game.spawnEntity(Particle_Red, this.pos.x + (this.flip ? this.size.x - 2 : 0), this.pos.y + this.size.y / 2, {
                    flip: this.flip,
                    velx: (Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.x / 2)
                });
                ig.game.spawnEntity(Particle_DarkRed, this.pos.x + (this.flip ? this.size.x - 2 : 0), this.pos.y + this.size.y / 2, {
                    flip: this.flip,
                    velx: (Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.x / 2)
                });
                ig.game.spawnEntity(Particle_DarkRed, this.pos.x + (this.flip ? this.size.x - 2 : 0), this.pos.y + this.size.y / 2, {
                    flip: this.flip,
                    velx: (Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.x / 2)
                });
            }
        },
        check: function (other) {
            if (other == ig.game.player) {
                other.receiveDamage(this.damage, this, this.pos.x, this.pos.y);
            }
            this.kill();
        }
    });
});

// lib/game/entities/particles.js
ig.baked = true;
ig.module('game.entities.particles').requires('impact.entity').defines(function () {
    EntityParticles = ig.Entity.extend({
        size: {
            x: 2,
            y: 2
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 400,
            y: 400
        },
        lifetime: 5,
        fadetime: 1,
        bounciness: 0,
        type: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.PASSIVE,
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            var entitycount = ig.game.getEntitiesByType(EntityParticles)[ig.game.entitylimit];
            if (entitycount) {
                this.kill();
            }
            this.vel.x = (this.flip ? -settings.velx : settings.velx);
            this.vel.y = settings.vely;
            this.addAnim('idle', 0.2, [0]);
            this.idleTimer = new ig.Timer();
        },
        handleMovementTrace: function (res) {
            this.parent(res);
            if (res.collision.x || res.collision.y) {
                this.bounceCounter++;
                if (this.bounceCounter > 0) {
                    this.kill();
                }
            }
        },
        update: function () {
            this.currentAnim.alpha = 1 - (this.idleTimer.delta() / this.lifetime);
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
                this.currentAnim.alpha = this.idleTimer.delta().map(this.lifetime - this.fadetime, this.lifetime, 1, 0);
            }
            this.parent();
        }
    });
    Particle_Red = EntityParticles.extend({
        lifetime: .5,
        animSheet: new ig.AnimationSheet('media/particle-red.png', 2, 2)
    });
    Particle_DarkRed = EntityParticles.extend({
        lifetime: .5,
        animSheet: new ig.AnimationSheet('media/particle-darkred.png', 2, 2)
    });
    Particle_Blue = EntityParticles.extend({
        lifetime: .5,
        animSheet: new ig.AnimationSheet('media/particle-blue.png', 2, 2)
    });
    Particle_DarkBlue = EntityParticles.extend({
        lifetime: .5,
        animSheet: new ig.AnimationSheet('media/particle-darkblue.png', 2, 2)
    });
    Particle_Grey = EntityParticles.extend({
        lifetime: .5,
        animSheet: new ig.AnimationSheet('media/particle-grey.png', 2, 2)
    });
    Particle_DarkGrey = EntityParticles.extend({
        lifetime: .5,
        animSheet: new ig.AnimationSheet('media/particle-darkgrey.png', 2, 2)
    });
    Particle_Orange = EntityParticles.extend({
        lifetime: .5,
        animSheet: new ig.AnimationSheet('media/particle-orange.png', 2, 2)
    });
    Particle_Yellow = EntityParticles.extend({
        lifetime: .5,
        animSheet: new ig.AnimationSheet('media/particle-yellow.png', 2, 2)
    });
    Particle_Purple = EntityParticles.extend({
        lifetime: .5,
        animSheet: new ig.AnimationSheet('media/particle-purple.png', 2, 2)
    });
    Particle_DarkPurple = EntityParticles.extend({
        lifetime: .5,
        animSheet: new ig.AnimationSheet('media/particle-darkpurple.png', 2, 2)
    });
});

// lib/game/entities/effects.js
ig.baked = true;
ig.module('game.entities.effects').requires('impact.entity').defines(function () {
    EntityEffects = ig.Entity.extend({
        size: {
            x: 0,
            y: 0
        },
        offset: {
            x: 0,
            y: 0
        },
        lifetime: .05,
        fadetime: .05,
        accelGround: 600,
        accelAir: 300,
        maxVel: {
            x: 1000,
            y: 1000
        },
        bounciness: 0,
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        bounceCounter: 0,
        zIndex: -10,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.gravityFactor = 0;
            if (settings.velx != 0) {
                this.vel.x = settings.velx;
            } else {
                this.vel.x = 0;
            }
            if (settings.vely != 0) {
                this.vel.y = settings.vely;
            } else {
                this.vel.y = 0;
            }
            this.addAnim('idle', 0.2, [0]);
            this.zIndex = -10;
            this.flip = settings.flip;
            this.anims.idle.flip.x = this.flip;
            this.idleTimer = new ig.Timer();
        },
        update: function () {
            this.currentAnim.alpha = 1 - (this.idleTimer.delta() / this.lifetime);
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
                this.currentAnim.alpha = this.idleTimer.delta().map(this.lifetime - this.fadetime, this.lifetime, 1, 0);
            }
            this.parent();
        }
    });
    EntityGunFlare = EntityEffects.extend({
        lifetime: .1,
        fadetime: .05,
        size: {
            x: 106,
            y: 106
        },
        arm: null,
        animSheet: new ig.AnimationSheet('media/effect-gunflare.png', 106, 106),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.gravityFactor = 0;
            if (settings.velx != 0) {
                this.vel.x = settings.velx;
            } else {
                this.vel.x = 0;
            }
            if (settings.vely != 0) {
                this.vel.y = settings.vely;
            } else {
                this.vel.y = 0;
            }
            this.addAnim('idle', 0.2, [0]);
            this.zIndex = -10;
            this.arm = ig.game.getEntityByName('arm');
            this.flip = this.arm.flip;
            this.anims.idle.flip.x = this.flip;
            this.pos.x = this.arm.pos.x - 21;
            this.pos.y = this.arm.pos.y - 21;
            this.currentAnim.angle = this.arm.currentAnim.angle;
            this.idleTimer = new ig.Timer();
        },
        update: function () {
            this.arm = ig.game.getEntityByName('arm');
            if (this.arm) {
                this.flip = this.arm.flip;
                this.anims.idle.flip.x = this.flip;
                if (ig.game.gravity < 0) {
                    this.currentAnim.flip.y = true;
                } else {
                    this.currentAnim.flip.y = false;
                }
                this.pos.x = this.arm.pos.x - 21;
                this.pos.y = this.arm.pos.y - 21;
                this.currentAnim.angle = this.arm.currentAnim.angle;
                this.vel.x = this.arm.vel.x;
                this.vel.y = this.arm.vel.y;
                this.currentAnim.alpha = 1 - (this.idleTimer.delta() / this.lifetime);
                if (this.idleTimer.delta() > this.lifetime) {
                    this.kill();
                    this.currentAnim.alpha = this.idleTimer.delta().map(this.lifetime - this.fadetime, this.lifetime, 1, 0);
                }
            } else {
                this.kill();
            }
            this.parent();
        }
    });
    EntityEnemyGunFlare = EntityEffects.extend({
        lifetime: .1,
        fadetime: .05,
        size: {
            x: 106,
            y: 106
        },
        arm: null,
        animSheet: new ig.AnimationSheet('media/effect-enemygunflare.png', 106, 106),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.gravityFactor = 0;
            if (settings.velx != 0) {
                this.vel.x = settings.velx;
            } else {
                this.vel.x = 0;
            }
            if (settings.vely != 0) {
                this.vel.y = settings.vely;
            } else {
                this.vel.y = 0;
            }
            this.addAnim('idle', 0.2, [0]);
            this.zIndex = -10;
            this.currentAnim.angle = settings.angle;
            this.idleTimer = new ig.Timer();
        },
        update: function () {
            this.currentAnim.alpha = 1 - (this.idleTimer.delta() / this.lifetime);
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
                this.currentAnim.alpha = this.idleTimer.delta().map(this.lifetime - this.fadetime, this.lifetime, 1, 0);
            }
            this.parent();
        }
    });
    EntityWarpEnterEffect = ig.Entity.extend({
        size: {
            x: 60,
            y: 60
        },
        offset: {
            x: 0,
            y: 0
        },
        lifetime: .5,
        fadetime: .1,
        maxVel: {
            x: 0,
            y: 0
        },
        bounciness: 0,
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        animSheet: new ig.AnimationSheet('media/effect-warpenter.png', 60, 60),
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.gravityFactor = 0;
            this.zIndex = -5;
            this.vel.x = 0;
            this.vel.y = 0;
            this.addAnim('idle', 0.1, [2, 1, 0, 1, 2], [1]);
            this.idleTimer = new ig.Timer();
        },
        update: function () {
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
                this.currentAnim.alpha = this.idleTimer.delta().map(this.lifetime - this.fadetime, this.lifetime, 1, 0);
            }
            this.parent();
        }
    });
    EntityWarpExitEffect = ig.Entity.extend({
        size: {
            x: 60,
            y: 60
        },
        offset: {
            x: 0,
            y: 0
        },
        lifetime: .5,
        fadetime: .1,
        maxVel: {
            x: 0,
            y: 0
        },
        bounciness: 0,
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        animSheet: new ig.AnimationSheet('media/effect-warpexit.png', 60, 60),
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.gravityFactor = 0;
            this.zIndex = -5;
            this.vel.x = 0;
            this.vel.y = 0;
            this.addAnim('idle', 0.1, [2, 1, 0, 1, 2], [1]);
            this.idleTimer = new ig.Timer();
        },
        update: function () {
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
                this.currentAnim.alpha = this.idleTimer.delta().map(this.lifetime - this.fadetime, this.lifetime, 1, 0);
            }
            this.parent();
        }
    });
    EntityWarpEnemyEffect = ig.Entity.extend({
        size: {
            x: 60,
            y: 60
        },
        offset: {
            x: 0,
            y: 0
        },
        lifetime: .5,
        fadetime: .1,
        maxVel: {
            x: 1000,
            y: 1000
        },
        bounciness: 0,
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        animSheet: new ig.AnimationSheet('media/effect-warpenemy.png', 60, 60),
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.gravityFactor = 0;
            this.zIndex = -5;
            if (settings.velx || settings.vely) {
                this.vel.x = settings.velx;
                this.vel.y = settings.vely;
            } else {
                this.vel.x = 0;
                this.vel.y = 0;
            }
            this.addAnim('idle', 0.1, [2, 1, 0, 1, 2], [1]);
            this.idleTimer = new ig.Timer();
        },
        update: function () {
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
                this.currentAnim.alpha = this.idleTimer.delta().map(this.lifetime - this.fadetime, this.lifetime, 1, 0);
            }
            this.parent();
        }
    });
    EntityPlayerSpawnEffect = ig.Entity.extend({
        size: {
            x: 120,
            y: 120
        },
        offset: {
            x: 0,
            y: 0
        },
        lifetime: .5,
        fadetime: .1,
        maxVel: {
            x: 0,
            y: 0
        },
        bounciness: 0,
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        animSheet: new ig.AnimationSheet('media/effect-playerspawn.png', 120, 120),
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.gravityFactor = 0;
            this.zIndex = -5;
            this.vel.x = 0;
            this.vel.y = 0;
            this.addAnim('idle', 0.1, [2, 1, 0, 1, 2], [1]);
            this.idleTimer = new ig.Timer();
        },
        update: function () {
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
                this.currentAnim.alpha = this.idleTimer.delta().map(this.lifetime - this.fadetime, this.lifetime, 1, 0);
            }
            this.parent();
        }
    });
    EntityPortalExitEffect = ig.Entity.extend({
        size: {
            x: 120,
            y: 120
        },
        offset: {
            x: 0,
            y: 0
        },
        lifetime: .2,
        fadetime: .1,
        maxVel: {
            x: 0,
            y: 0
        },
        bounciness: 0,
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        animSheet: new ig.AnimationSheet('media/effect-portalexit.png', 120, 120),
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.gravityFactor = 0;
            this.zIndex = -5;
            this.vel.x = 0;
            this.vel.y = 0;
            this.addAnim('idle', 0.04, [2, 1, 0, 1, 2], [1]);
            this.idleTimer = new ig.Timer();
        },
        update: function () {
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
                this.currentAnim.alpha = this.idleTimer.delta().map(this.lifetime - this.fadetime, this.lifetime, 1, 0);
            }
            this.parent();
        }
    });
    EntityPortalEnterEffect = EntityPortalExitEffect.extend({
        animSheet: new ig.AnimationSheet('media/effect-portalenter.png', 120, 120)
    });
    EntityLevelFinishEffect = EntityPlayerSpawnEffect.extend({
        animSheet: new ig.AnimationSheet('media/effect-levelfinish.png', 120, 120)
    });
    ExplosionEffect = ig.Entity.extend({
        size: {
            x: 60,
            y: 60
        },
        offset: {
            x: 0,
            y: 0
        },
        lifetime: .25,
        fadetime: .1,
        owner: null,
        maxVel: {
            x: 0,
            y: 0
        },
        bounciness: 0,
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        animSheet: new ig.AnimationSheet('media/effect-explosion.png', 60, 60),
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.gravityFactor = 0;
            this.zIndex = -5;
            this.owner = settings.owner;
            this.vel.x = 0;
            this.vel.y = 0;
            this.addAnim('idle', 0.05, [2, 1, 0, 1, 2], [1]);
            this.idleTimer = new ig.Timer();
            if (ig.Sound.enabled) {
                ig.game.explosion1.play();
            }
        },
        update: function () {
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
            }
            this.parent();
        }
    });
    ExplosionLargeEffect = ig.Entity.extend({
        size: {
            x: 180,
            y: 180
        },
        offset: {
            x: 0,
            y: 0
        },
        lifetime: .25,
        fadetime: .1,
        maxVel: {
            x: 0,
            y: 0
        },
        owner: null,
        bounciness: 0,
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        animSheet: new ig.AnimationSheet('media/effect-explosionlarge.png', 180, 180),
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.gravityFactor = 0;
            this.zIndex = -5;
            this.owner = settings.owner;
            this.vel.x = 0;
            this.vel.y = 0;
            this.addAnim('idle', 0.05, [2, 1, 0, 1, 2], [1]);
            this.idleTimer = new ig.Timer();
            if (ig.Sound.enabled) {
                ig.game.explosion1.play();
            }
        },
        update: function () {
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
            }
            this.parent();
        }
    });
    ItemGlowEffect = ig.Entity.extend({
        size: {
            x: 30,
            y: 30
        },
        offset: {
            x: 0,
            y: 0
        },
        lifetime: .25,
        fadetime: .1,
        maxVel: {
            x: 0,
            y: 0
        },
        bounciness: 0,
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.BOTH,
        collides: ig.Entity.COLLIDES.NONE,
        animSheet: new ig.AnimationSheet('media/effect-itemglow.png', 30, 30),
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.gravityFactor = 0;
            this.zIndex = -10;
            this.vel.x = 0;
            this.vel.y = 0;
            this.addAnim('idle', 0.1, [2, 1, 0, 1, 2]);
            this.idleTimer = new ig.Timer();
        },
        check: function (other) {
            this.kill();
        },
        update: function () {
            this.parent();
        }
    });
    EntityCasing = ig.Entity.extend({
        size: {
            x: 10,
            y: 4
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 500,
            y: 500
        },
        lifetime: 1,
        fadetime: 1,
        bounciness: .6,
        type: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.PASSIVE,
        animSheet: new ig.AnimationSheet('media/casing.png', 10, 4),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.vel.x = (settings.flip ? -1 : 1) * Math.floor(Math.random() * this.maxVel.x) * Math.cos(settings.angle + Math.PI);
            this.vel.y = Math.floor(Math.random() * this.maxVel.y) * Math.sin(settings.angle + Math.PI);
            this.addAnim('idle', 0.1, [0]);
            this.idleTimer = new ig.Timer();
        },
        update: function () {
            this.vel.x = this.vel.x * .95;
            this.currentAnim.angle = (Math.random() * Math.abs(Math.PI));
            this.currentAnim.alpha = 1 - (this.idleTimer.delta() / this.lifetime);
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
                this.currentAnim.alpha = this.idleTimer.delta().map(this.lifetime - this.fadetime, this.lifetime, 1, 0);
            }
            this.parent();
        }
    });
    EntityArrowLeft = ig.Entity.extend({
        size: {
            x: 64,
            y: 64
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 0,
            y: 0
        },
        bounciness: 0,
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        animSheet: new ig.AnimationSheet('media/arrowleft.png', 64, 64),
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.gravityFactor = 0;
            this.vel.x = 0;
            this.vel.y = 0;
            this.addAnim('idle', 0.1, [0]);
        }
    });
    EntityArrowLeft = ig.Entity.extend({
        size: {
            x: 32,
            y: 32
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 0,
            y: 0
        },
        bounciness: 0,
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        animSheet: new ig.AnimationSheet('media/arrowleft.png', 32, 32),
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.gravityFactor = 0;
            this.vel.x = 0;
            this.vel.y = 0;
            this.addAnim('idle', 0.1, [0]);
            this.currentAnim.alpha = .5;
        }
    });
    EntityArrowRight = EntityArrowLeft.extend({
        animSheet: new ig.AnimationSheet('media/arrowright.png', 32, 32)
    });
    EntityArrowUp = EntityArrowLeft.extend({
        animSheet: new ig.AnimationSheet('media/arrowup.png', 32, 32)
    });
    EntityArrowDown = EntityArrowLeft.extend({
        animSheet: new ig.AnimationSheet('media/arrowdown.png', 32, 32)
    });
    EntitySpringBounceEffect = ig.Entity.extend({
        size: {
            x: 120,
            y: 120
        },
        offset: {
            x: 0,
            y: 0
        },
        lifetime: .2,
        fadetime: .1,
        maxVel: {
            x: 0,
            y: 0
        },
        bounciness: 0,
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        animSheet: new ig.AnimationSheet('media/effect-springbounce.png', 120, 120),
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.gravityFactor = 0;
            this.zIndex = -5;
            this.vel.x = 0;
            this.vel.y = 0;
            this.addAnim('idle', 0.04, [2, 1, 0, 1, 2], [1]);
            this.idleTimer = new ig.Timer();
            this.currentAnim.angle = settings.angle;
        },
        update: function () {
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
                this.currentAnim.alpha = this.idleTimer.delta().map(this.lifetime - this.fadetime, this.lifetime, 1, 0);
            }
            this.parent();
        }
    });
    EntityTimeBonus = ig.Entity.extend({
        size: {
            x: 32,
            y: 32
        },
        offset: {
            x: 0,
            y: 0
        },
        lifetime: 1,
        fadetime: .1,
        maxVel: {
            x: 500,
            y: 500
        },
        bounciness: 0,
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        animSheet: new ig.AnimationSheet('media/timebonus.png', 32, 32),
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.gravityFactor = 0;
            this.zIndex = -5;
            this.vel.x = 0;
            this.addAnim('idle', .1, [0], [1]);
            this.currentAnim.alpha = 0;
            this.idleTimer = new ig.Timer();
            var time = ig.game.getEntityByName('leveltime');
            if (time) {
                if (time.frames > 60) {
                    time.frames = time.frames - 15;
                }
            }
        },
        update: function () {
            this.vel.y = -40;
            if (this.idleTimer.delta() < .2) {
                this.currentAnim.alpha = this.idleTimer.delta() * 5;
            } else {
                this.currentAnim.alpha = 1 - (this.idleTimer.delta() / this.lifetime);
            }
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
                this.currentAnim.alpha = this.idleTimer.delta().map(this.lifetime - this.fadetime, this.lifetime, 1, 0);
            }
            this.parent();
        }
    });
    EntityPlayerBreadcrumb = ig.Entity.extend({
        size: {
            x: 30,
            y: 30
        },
        offset: {
            x: 0,
            y: 0
        },
        lifetime: 2,
        fadetime: .1,
        maxVel: {
            x: 0,
            y: 0
        },
        bounciness: 0,
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.NONE,
        animSheet: new ig.AnimationSheet('media/effect-breadcrumb.png', 30, 30),
        bounceCounter: 0,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.gravityFactor = 0;
            this.zIndex = -10;
            this.vel.x = 0;
            this.vel.y = 0;
            if (settings.speed == "fast") {
                this.addAnim('idle', 0.2, [0, 1, 2], [1]);
            } else if (settings.speed == "med") {
                this.addAnim('idle', 0.2, [3, 4, 5], [1]);
            } else {
                this.addAnim('idle', 0.2, [6, 7, 8], [1]);
            }
            this.idleTimer = new ig.Timer();
        },
        update: function () {
            this.currentAnim.alpha = 1 - (this.idleTimer.delta() / this.lifetime);
            if (this.idleTimer.delta() > this.lifetime) {
                this.kill();
            }
            this.parent();
        },
        check: function (other) {
            if (other == ig.game.player) {
                this.kill();
            }
        }
    });
});

// lib/game/entities/spring.js
ig.baked = true;
ig.module('game.entities.spring').requires('impact.entity').defines(function () {
    EntitySpring = ig.Entity.extend({
        size: {
            x: 32,
            y: 16
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 500,
            y: 500
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(0, 255, 100, 0.7)',
        type: ig.Entity.TYPE.A,
        checkAgainst: ig.Entity.TYPE.BOTH,
        collides: ig.Entity.COLLIDES.FIXED,
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(255, 0, 100, 0.7)',
        target: null,
        targets: [],
        currentTarget: 0,
        speed: 0,
        gravityFactor: 0,
        name: 'spring',
        animSheet: new ig.AnimationSheet('media/spring.png', 32, 16),
        init: function (x, y, settings) {
            this.addAnim('launch', .2, [1]);
            this.addAnim('idle', .1, [0]);
            this.curentAnim = this.anims.idle;
            this.parent(x, y, settings);
            if (this.target) {
                this.targets = ig.ksort(this.target);
            }
        },
        update: function () {
            if (this.anims.launch.loopCount > 0) {
                this.currentAnim = this.anims.idle;
            }
            if (this.target) {
                var oldDistance = 0;
                var target = ig.game.getEntityByName(this.targets[this.currentTarget]);
                if (target) {
                    oldDistance = this.distanceTo(target);
                    var angle = this.angleTo(target);
                    this.vel.x = Math.cos(angle) * this.speed;
                    this.vel.y = Math.sin(angle) * this.speed;
                } else {
                    this.vel.x = 0;
                    this.vel.y = 0;
                }
                var newDistance = this.distanceTo(target);
                if (target && (newDistance > oldDistance || newDistance < 0.5)) {
                    this.pos.x = target.pos.x + target.size.x / 2 - this.size.x / 2;
                    this.pos.y = target.pos.y + target.size.y / 2 - this.size.y / 2;
                    this.currentTarget++;
                    if (this.currentTarget >= this.targets.length && this.targets.length > 1) {
                        this.currentTarget = 0;
                    }
                }
            } else {
                this.vel.x = 0;
                this.vel.y = 0;
            }
            this.parent();
        },
        collideWith: function (other, axis) {
            if (other.pos.y <= this.pos.y) {
                if (axis == 'y') {
                    if (Math.abs((other.pos.x + other.size.x / 2) - (this.pos.x + this.size.x / 2)) <= ((this.size.x / 2) + other.size.x * .5)) {
                        other.vel.y = -700;
                        this.currentAnim = this.anims.launch.rewind();
                        if (other == ig.game.player) {
                            if (ig.Sound.enabled) {
                                ig.game.bounce.play();
                            }
                            ig.game.spawnEntity(EntitySpringBounceEffect, this.pos.x + this.size.x / 2 - 60, this.pos.y + this.size.y / 2 - 60, {
                                angle: -Math.PI / 2
                            });
                        }
                    }
                }
            }
        },
        receiveDamage: function (amount, from, x, y) {
            this.health = this.health;
        }
    });
});

// lib/game/entities/springleft.js
ig.baked = true;
ig.module('game.entities.springleft').requires('impact.entity').defines(function () {
    EntitySpringleft = ig.Entity.extend({
        size: {
            x: 16,
            y: 32
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 500,
            y: 500
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(0, 255, 100, 0.7)',
        type: ig.Entity.TYPE.A,
        checkAgainst: ig.Entity.TYPE.BOTH,
        collides: ig.Entity.COLLIDES.FIXED,
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(255, 0, 100, 0.7)',
        target: null,
        targets: [],
        currentTarget: 0,
        speed: 0,
        gravityFactor: 0,
        name: 'spring',
        animSheet: new ig.AnimationSheet('media/spring-left.png', 16, 32),
        init: function (x, y, settings) {
            this.addAnim('launch', .2, [1]);
            this.addAnim('idle', .1, [0]);
            this.curentAnim = this.anims.idle;
            this.parent(x, y, settings);
            if (this.target) {
                this.targets = ig.ksort(this.target);
            }
        },
        update: function () {
            if (this.anims.launch.loopCount > 0) {
                this.currentAnim = this.anims.idle;
            }
            if (this.target) {
                var oldDistance = 0;
                var target = ig.game.getEntityByName(this.targets[this.currentTarget]);
                if (target) {
                    oldDistance = this.distanceTo(target);
                    var angle = this.angleTo(target);
                    this.vel.x = Math.cos(angle) * this.speed;
                    this.vel.y = Math.sin(angle) * this.speed;
                } else {
                    this.vel.x = 0;
                    this.vel.y = 0;
                }
                var newDistance = this.distanceTo(target);
                if (target && (newDistance > oldDistance || newDistance < 0.5)) {
                    this.pos.x = target.pos.x + target.size.x / 2 - this.size.x / 2;
                    this.pos.y = target.pos.y + target.size.y / 2 - this.size.y / 2;
                    this.currentTarget++;
                    if (this.currentTarget >= this.targets.length && this.targets.length > 1) {
                        this.currentTarget = 0;
                    }
                }
            } else {
                this.vel.x = 0;
                this.vel.y = 0;
            }
            this.parent();
        },
        collideWith: function (other, axis) {
            if (other.pos.x <= this.pos.x) {
                if (axis == 'x') {
                    if (Math.abs((other.pos.y + other.size.y / 2) - (this.pos.y + this.size.y / 2)) <= ((this.size.y / 2) + other.size.y * .5)) {
                        other.vel.x = -700;
                        this.currentAnim = this.anims.launch.rewind();
                        if (other == ig.game.player) {
                            if (ig.Sound.enabled) {
                                ig.game.bounce.play();
                            }
                            ig.game.spawnEntity(EntitySpringBounceEffect, this.pos.x + this.size.x / 2 - 60, this.pos.y + this.size.y / 2 - 60, {
                                angle: Math.PI
                            });
                        }
                    }
                }
            }
        },
        receiveDamage: function (amount, from, x, y) {
            this.health = this.health;
        }
    });
});

// lib/game/entities/springright.js
ig.baked = true;
ig.module('game.entities.springright').requires('impact.entity').defines(function () {
    EntitySpringright = ig.Entity.extend({
        size: {
            x: 16,
            y: 32
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 500,
            y: 500
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(0, 255, 100, 0.7)',
        type: ig.Entity.TYPE.A,
        checkAgainst: ig.Entity.TYPE.BOTH,
        collides: ig.Entity.COLLIDES.FIXED,
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(255, 0, 100, 0.7)',
        target: null,
        targets: [],
        currentTarget: 0,
        speed: 0,
        gravityFactor: 0,
        name: 'spring',
        animSheet: new ig.AnimationSheet('media/spring-right.png', 16, 32),
        init: function (x, y, settings) {
            this.addAnim('launch', .2, [1]);
            this.addAnim('idle', .1, [0]);
            this.curentAnim = this.anims.idle;
            this.parent(x, y, settings);
            if (this.target) {
                this.targets = ig.ksort(this.target);
            }
        },
        update: function () {
            if (this.anims.launch.loopCount > 0) {
                this.currentAnim = this.anims.idle;
            }
            if (this.target) {
                var oldDistance = 0;
                var target = ig.game.getEntityByName(this.targets[this.currentTarget]);
                if (target) {
                    oldDistance = this.distanceTo(target);
                    var angle = this.angleTo(target);
                    this.vel.x = Math.cos(angle) * this.speed;
                    this.vel.y = Math.sin(angle) * this.speed;
                } else {
                    this.vel.x = 0;
                    this.vel.y = 0;
                }
                var newDistance = this.distanceTo(target);
                if (target && (newDistance > oldDistance || newDistance < 0.5)) {
                    this.pos.x = target.pos.x + target.size.x / 2 - this.size.x / 2;
                    this.pos.y = target.pos.y + target.size.y / 2 - this.size.y / 2;
                    this.currentTarget++;
                    if (this.currentTarget >= this.targets.length && this.targets.length > 1) {
                        this.currentTarget = 0;
                    }
                }
            } else {
                this.vel.x = 0;
                this.vel.y = 0;
            }
            this.parent();
        },
        collideWith: function (other, axis) {
            if (other.pos.x >= this.pos.x) {
                if (axis == 'x') {
                    if (Math.abs((other.pos.y + other.size.y / 2) - (this.pos.y + this.size.y / 2)) <= ((this.size.y / 2) + other.size.y * .5)) {
                        other.vel.x = 700;
                        this.currentAnim = this.anims.launch.rewind();
                        if (other == ig.game.player) {
                            if (ig.Sound.enabled) {
                                ig.game.bounce.play();
                            }
                            ig.game.spawnEntity(EntitySpringBounceEffect, this.pos.x + this.size.x / 2 - 60, this.pos.y + this.size.y / 2 - 60, {
                                angle: 0
                            });
                        }
                    }
                }
            }
        },
        receiveDamage: function (amount, from, x, y) {
            this.health = this.health;
        }
    });
});

// lib/game/entities/springupleft.js
ig.baked = true;
ig.module('game.entities.springupleft').requires('impact.entity').defines(function () {
    EntitySpringupleft = ig.Entity.extend({
        size: {
            x: 32,
            y: 32
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 500,
            y: 500
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(0, 255, 100, 0.7)',
        type: ig.Entity.TYPE.A,
        checkAgainst: ig.Entity.TYPE.BOTH,
        collides: ig.Entity.COLLIDES.FIXED,
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(255, 0, 100, 0.7)',
        target: null,
        targets: [],
        currentTarget: 0,
        speed: 0,
        gravityFactor: 0,
        name: 'spring',
        animSheet: new ig.AnimationSheet('media/springupleft.png', 32, 32),
        init: function (x, y, settings) {
            this.addAnim('launch', .2, [0]);
            this.addAnim('idle', .1, [0]);
            this.curentAnim = this.anims.idle;
            this.parent(x, y, settings);
            if (this.target) {
                this.targets = ig.ksort(this.target);
            }
        },
        update: function () {
            if (this.anims.launch.loopCount > 0) {
                this.currentAnim = this.anims.idle;
            }
            if (this.target) {
                var oldDistance = 0;
                var target = ig.game.getEntityByName(this.targets[this.currentTarget]);
                if (target) {
                    oldDistance = this.distanceTo(target);
                    var angle = this.angleTo(target);
                    this.vel.x = Math.cos(angle) * this.speed;
                    this.vel.y = Math.sin(angle) * this.speed;
                } else {
                    this.vel.x = 0;
                    this.vel.y = 0;
                }
                var newDistance = this.distanceTo(target);
                if (target && (newDistance > oldDistance || newDistance < 0.5)) {
                    this.pos.x = target.pos.x + target.size.x / 2 - this.size.x / 2;
                    this.pos.y = target.pos.y + target.size.y / 2 - this.size.y / 2;
                    this.currentTarget++;
                    if (this.currentTarget >= this.targets.length && this.targets.length > 1) {
                        this.currentTarget = 0;
                    }
                }
            } else {
                this.vel.x = 0;
                this.vel.y = 0;
            }
            this.parent();
        },
        collideWith: function (other, axis) {
            other.vel.y = -700;
            other.vel.x = -500;
            this.currentAnim = this.anims.launch.rewind();
            if (other == ig.game.player) {
                if (ig.Sound.enabled) {
                    ig.game.bounce.play();
                }
                ig.game.spawnEntity(EntitySpringBounceEffect, this.pos.x + this.size.x / 2 - 60, this.pos.y + this.size.y / 2 - 60, {
                    angle: -Math.PI * .75
                });
            }
        },
        receiveDamage: function (amount, from, x, y) {
            this.health = this.health;
        }
    });
});

// lib/game/entities/springupright.js
ig.baked = true;
ig.module('game.entities.springupright').requires('impact.entity').defines(function () {
    EntitySpringupright = ig.Entity.extend({
        size: {
            x: 32,
            y: 32
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 500,
            y: 500
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(0, 255, 100, 0.7)',
        type: ig.Entity.TYPE.A,
        checkAgainst: ig.Entity.TYPE.BOTH,
        collides: ig.Entity.COLLIDES.FIXED,
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(255, 0, 100, 0.7)',
        target: null,
        targets: [],
        currentTarget: 0,
        speed: 0,
        gravityFactor: 0,
        name: 'spring',
        animSheet: new ig.AnimationSheet('media/springupright.png', 32, 32),
        init: function (x, y, settings) {
            this.addAnim('launch', .2, [0]);
            this.addAnim('idle', .1, [0]);
            this.curentAnim = this.anims.idle;
            this.parent(x, y, settings);
            if (this.target) {
                this.targets = ig.ksort(this.target);
            }
        },
        update: function () {
            if (this.anims.launch.loopCount > 0) {
                this.currentAnim = this.anims.idle;
            }
            if (this.target) {
                var oldDistance = 0;
                var target = ig.game.getEntityByName(this.targets[this.currentTarget]);
                if (target) {
                    oldDistance = this.distanceTo(target);
                    var angle = this.angleTo(target);
                    this.vel.x = Math.cos(angle) * this.speed;
                    this.vel.y = Math.sin(angle) * this.speed;
                } else {
                    this.vel.x = 0;
                    this.vel.y = 0;
                }
                var newDistance = this.distanceTo(target);
                if (target && (newDistance > oldDistance || newDistance < 0.5)) {
                    this.pos.x = target.pos.x + target.size.x / 2 - this.size.x / 2;
                    this.pos.y = target.pos.y + target.size.y / 2 - this.size.y / 2;
                    this.currentTarget++;
                    if (this.currentTarget >= this.targets.length && this.targets.length > 1) {
                        this.currentTarget = 0;
                    }
                }
            } else {
                this.vel.x = 0;
                this.vel.y = 0;
            }
            this.parent();
        },
        collideWith: function (other, axis) {
            other.vel.y = -700;
            other.vel.x = 500;
            this.currentAnim = this.anims.launch.rewind();
            if (other == ig.game.player) {
                if (ig.Sound.enabled) {
                    ig.game.bounce.play();
                }
                ig.game.spawnEntity(EntitySpringBounceEffect, this.pos.x + this.size.x / 2 - 60, this.pos.y + this.size.y / 2 - 60, {
                    angle: -Math.PI * .25
                });
            }
        },
        receiveDamage: function (amount, from, x, y) {
            this.health = this.health;
        }
    });
});

// lib/game/entities/springdownleft.js
ig.baked = true;
ig.module('game.entities.springdownleft').requires('impact.entity').defines(function () {
    EntitySpringdownleft = ig.Entity.extend({
        size: {
            x: 32,
            y: 32
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 500,
            y: 500
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(0, 255, 100, 0.7)',
        type: ig.Entity.TYPE.A,
        checkAgainst: ig.Entity.TYPE.BOTH,
        collides: ig.Entity.COLLIDES.FIXED,
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(255, 0, 100, 0.7)',
        target: null,
        targets: [],
        currentTarget: 0,
        speed: 0,
        gravityFactor: 0,
        name: 'spring',
        animSheet: new ig.AnimationSheet('media/springupleft.png', 32, 32),
        init: function (x, y, settings) {
            this.addAnim('launch', .2, [0]);
            this.addAnim('idle', .1, [0]);
            this.curentAnim = this.anims.idle;
            this.parent(x, y, settings);
            if (this.target) {
                this.targets = ig.ksort(this.target);
            }
            this.anims.launch.flip.y = true;
            this.anims.idle.flip.y = true;
        },
        update: function () {
            if (this.anims.launch.loopCount > 0) {
                this.currentAnim = this.anims.idle;
            }
            if (this.target) {
                var oldDistance = 0;
                var target = ig.game.getEntityByName(this.targets[this.currentTarget]);
                if (target) {
                    oldDistance = this.distanceTo(target);
                    var angle = this.angleTo(target);
                    this.vel.x = Math.cos(angle) * this.speed;
                    this.vel.y = Math.sin(angle) * this.speed;
                } else {
                    this.vel.x = 0;
                    this.vel.y = 0;
                }
                var newDistance = this.distanceTo(target);
                if (target && (newDistance > oldDistance || newDistance < 0.5)) {
                    this.pos.x = target.pos.x + target.size.x / 2 - this.size.x / 2;
                    this.pos.y = target.pos.y + target.size.y / 2 - this.size.y / 2;
                    this.currentTarget++;
                    if (this.currentTarget >= this.targets.length && this.targets.length > 1) {
                        this.currentTarget = 0;
                    }
                }
            } else {
                this.vel.x = 0;
                this.vel.y = 0;
            }
            this.parent();
        },
        collideWith: function (other, axis) {
            other.vel.y = 700;
            other.vel.x = -500;
            this.currentAnim = this.anims.launch.rewind();
            if (other == ig.game.player) {
                if (ig.Sound.enabled) {
                    ig.game.bounce.play();
                }
                ig.game.spawnEntity(EntitySpringBounceEffect, this.pos.x + this.size.x / 2 - 60, this.pos.y + this.size.y / 2 - 60, {
                    angle: Math.PI * .75
                });
            }
        },
        receiveDamage: function (amount, from, x, y) {
            this.health = this.health;
        }
    });
});

// lib/game/entities/springdownright.js
ig.baked = true;
ig.module('game.entities.springdownright').requires('impact.entity').defines(function () {
    EntitySpringdownright = ig.Entity.extend({
        size: {
            x: 32,
            y: 32
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 500,
            y: 500
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(0, 255, 100, 0.7)',
        type: ig.Entity.TYPE.A,
        checkAgainst: ig.Entity.TYPE.BOTH,
        collides: ig.Entity.COLLIDES.FIXED,
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(255, 0, 100, 0.7)',
        target: null,
        targets: [],
        currentTarget: 0,
        speed: 0,
        gravityFactor: 0,
        name: 'spring',
        animSheet: new ig.AnimationSheet('media/springupright.png', 32, 32),
        init: function (x, y, settings) {
            this.addAnim('launch', .2, [0]);
            this.addAnim('idle', .1, [0]);
            this.curentAnim = this.anims.idle;
            this.parent(x, y, settings);
            if (this.target) {
                this.targets = ig.ksort(this.target);
            }
            this.anims.launch.flip.y = true;
            this.anims.idle.flip.y = true;
        },
        update: function () {
            if (this.anims.launch.loopCount > 0) {
                this.currentAnim = this.anims.idle;
            }
            if (this.target) {
                var oldDistance = 0;
                var target = ig.game.getEntityByName(this.targets[this.currentTarget]);
                if (target) {
                    oldDistance = this.distanceTo(target);
                    var angle = this.angleTo(target);
                    this.vel.x = Math.cos(angle) * this.speed;
                    this.vel.y = Math.sin(angle) * this.speed;
                } else {
                    this.vel.x = 0;
                    this.vel.y = 0;
                }
                var newDistance = this.distanceTo(target);
                if (target && (newDistance > oldDistance || newDistance < 0.5)) {
                    this.pos.x = target.pos.x + target.size.x / 2 - this.size.x / 2;
                    this.pos.y = target.pos.y + target.size.y / 2 - this.size.y / 2;
                    this.currentTarget++;
                    if (this.currentTarget >= this.targets.length && this.targets.length > 1) {
                        this.currentTarget = 0;
                    }
                }
            } else {
                this.vel.x = 0;
                this.vel.y = 0;
            }
            this.parent();
        },
        collideWith: function (other, axis) {
            other.vel.y = 700;
            other.vel.x = 500;
            this.currentAnim = this.anims.launch.rewind();
            if (other == ig.game.player) {
                if (ig.Sound.enabled) {
                    ig.game.bounce.play();
                }
                ig.game.spawnEntity(EntitySpringBounceEffect, this.pos.x + this.size.x / 2 - 60, this.pos.y + this.size.y / 2 - 60, {
                    angle: Math.PI * .25
                });
            }
        },
        receiveDamage: function (amount, from, x, y) {
            this.health = this.health;
        }
    });
});

// lib/game/entities/springdown.js
ig.baked = true;
ig.module('game.entities.springdown').requires('impact.entity').defines(function () {
    EntitySpringdown = ig.Entity.extend({
        size: {
            x: 32,
            y: 16
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 500,
            y: 500
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(0, 255, 100, 0.7)',
        type: ig.Entity.TYPE.A,
        checkAgainst: ig.Entity.TYPE.BOTH,
        collides: ig.Entity.COLLIDES.FIXED,
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(255, 0, 100, 0.7)',
        target: null,
        targets: [],
        currentTarget: 0,
        speed: 0,
        gravityFactor: 0,
        name: 'spring',
        animSheet: new ig.AnimationSheet('media/spring.png', 32, 16),
        init: function (x, y, settings) {
            this.addAnim('launch', .2, [1]);
            this.addAnim('idle', .1, [0]);
            this.curentAnim = this.anims.idle;
            this.parent(x, y, settings);
            if (this.target) {
                this.targets = ig.ksort(this.target);
            }
            this.anims.launch.flip.y = true;
            this.anims.idle.flip.y = true;
        },
        update: function () {
            if (this.anims.launch.loopCount > 0) {
                this.currentAnim = this.anims.idle;
            }
            if (this.target) {
                var oldDistance = 0;
                var target = ig.game.getEntityByName(this.targets[this.currentTarget]);
                if (target) {
                    oldDistance = this.distanceTo(target);
                    var angle = this.angleTo(target);
                    this.vel.x = Math.cos(angle) * this.speed;
                    this.vel.y = Math.sin(angle) * this.speed;
                } else {
                    this.vel.x = 0;
                    this.vel.y = 0;
                }
                var newDistance = this.distanceTo(target);
                if (target && (newDistance > oldDistance || newDistance < 0.5)) {
                    this.pos.x = target.pos.x + target.size.x / 2 - this.size.x / 2;
                    this.pos.y = target.pos.y + target.size.y / 2 - this.size.y / 2;
                    this.currentTarget++;
                    if (this.currentTarget >= this.targets.length && this.targets.length > 1) {
                        this.currentTarget = 0;
                    }
                }
            } else {
                this.vel.x = 0;
                this.vel.y = 0;
            }
            this.parent();
        },
        collideWith: function (other, axis) {
            if (other.pos.y >= this.pos.y) {
                if (axis == 'y') {
                    if (Math.abs((other.pos.x + other.size.x / 2) - (this.pos.x + this.size.x / 2)) <= ((this.size.x / 2) + other.size.x * .5)) {
                        other.vel.y = 700;
                        this.currentAnim = this.anims.launch.rewind();
                        if (other == ig.game.player) {
                            if (ig.Sound.enabled) {
                                ig.game.bounce.play();
                            }
                            ig.game.spawnEntity(EntitySpringBounceEffect, this.pos.x + this.size.x / 2 - 60, this.pos.y + this.size.y / 2 - 60, {
                                angle: Math.PI / 2
                            });
                        }
                    }
                }
            }
        },
        receiveDamage: function (amount, from, x, y) {
            this.health = this.health;
        }
    });
});

// lib/game/entities/speedarrow.js
ig.baked = true;
ig.module('game.entities.speedarrow').requires('impact.entity').defines(function () {
    EntitySpeedarrow = ig.Entity.extend({
        size: {
            x: 64,
            y: 64
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 500,
            y: 500
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(0, 0, 255, 0.5)',
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        gravityFactor: 0,
        name: '',
        angle: 0,
        angleradians: 0,
        animSheet: new ig.AnimationSheet('media/speedarrow.png', 64, 64),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('boost', .1, [1]);
            this.addAnim('idle', .1, [0]);
            this.currentAnim = this.anims.idle;
            this.angleradians = (this.angle * Math.PI) / 180;
            this.currentAnim.angle = this.angleradians;
        },
        update: function () {
            this.currentAnim = this.anims.idle;
            this.currentAnim.angle = this.angleradians;
            this.parent();
        },
        check: function (other) {
            if (other == ig.game.player) {
                if ((Math.abs((other.pos.x + other.size.x / 2) - (this.pos.x + this.size.x / 2)) < this.size.x / 2) && (Math.abs((other.pos.y + other.size.y / 2) - (this.pos.y + this.size.y / 2)) < this.size.y / 2)) {
                    this.currentAnim = this.anims.boost;
                    this.currentAnim.angle = this.angleradians;
                    other.vel.x = other.maxVel.x * Math.cos(this.angleradians) + other.vel.x;
                    other.vel.y = other.maxVel.y * Math.sin(this.angleradians) + other.vel.y;
                    ig.game.spawnEntity(EntitySpringBounceEffect, this.pos.x + this.size.x / 2 - 60, this.pos.y + this.size.y / 2 - 60, {
                        angle: this.angleradians
                    });
                }
            }
        },
        receiveDamage: function (amount, from, x, y) {
            this.health = this.health;
        }
    });
});

// lib/game/entities/leveltime.js
ig.baked = true;
ig.module('game.entities.leveltime').requires('impact.entity').defines(function () {
    EntityLeveltime = ig.Entity.extend({
        size: {
            x: 16,
            y: 16
        },
        _wmScalable: true,
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(0, 0, 255, 0.7)',
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.NEVER,
        time: 0,
        frames: 0,
        playerspawntimer: null,
        name: 'leveltime',
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.time = 0;
            this.frames = this.time * 30;
            ig.main.levelscore = 0;
            ig.main.scorechanged = false;
            ig.main.scorebonus = 0;
            ig.main.botscore = 0;
            this.playerspawntimer = new ig.Timer(2);
            ig.game.levelscore = 0;
        },
        update: function () {
            if (!ig.game.levelcomplete) {
                this.frames += 1;
                var fps = 30;
                if (ig.ua.mobile) {
                    fps = 20;
                } else {}
                this.time = ((this.frames) / fps).round(1);
                if (!ig.game.player && this.playerspawntimer.delta() >= 0) {
                    var portal = ig.game.getEntityByName('portal0');
                    var posx = portal.pos.x + portal.size.x / 2;
                    var posy = portal.pos.y + portal.size.y / 2;
                    ig.game.spawnEntity(EntityPlayerSpawnEffect, posx - 60, posy - 60);
                    ig.game.spawnEntity(EntityPlayer, posx - 16, posy - 24, {
                        flip: false
                    });
                    if (ig.Sound.enabled) {
                        ig.game.spawning.play();
                    }
                }
                if (!ig.game.player && this.playerspawntimer.delta() >= 0 && this.time > 3) {
                    if (ig.game.gravity < 0) {
                        ig.game.gravity = -ig.game.gravity;
                    }
                    ig.game.loadLevelDeferred(ig.global['Level' + ig.game.leveltoload]);
                }
            }
            this.parent();
        }
    });
});

// lib/game/entities/enemydrone1.js
ig.baked = true;
ig.module('game.entities.enemydrone1').requires('impact.entity').defines(function () {
    EntityEnemydrone1 = ig.Entity.extend({
        size: {
            x: 32,
            y: 32
        },
        offset: {
            x: 32,
            y: 0
        },
        maxVel: {
            x: 200,
            y: 200
        },
        friction: {
            x: 0,
            y: 0
        },
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        zIndex: 1,
        flip: false,
        accelGround: 600,
        accelAir: 600,
        bounciness: 0,
        health: null,
        hurttimer: null,
        hurtspacing: .1,
        inittimer: new ig.Timer(.4),
        gravityFactor: 0,
        angle: 0,
        animSheet: new ig.AnimationSheet('media/enemy-drone1.png', 64, 32),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.zIndex = 1;
            this.addAnim('idle', .2, [0, 1]);
            this.vel.x = 0;
            this.vel.y = 0;
            this.health = 10;
            this.inittimer.reset();
            this.hurttimer = new ig.Timer(this.hurtspacing);
        },
        update: function () {
            if (ig.game.player) {
                if (this.distanceTo(ig.game.player) < 600) {
                    var playerX = ig.game.player.pos.x + ig.game.player.size.x / 2;
                    var playerY = ig.game.player.pos.y + ig.game.player.size.y / 2;
                    this.angle = Math.atan2(playerY - (this.pos.y + this.size.y / 2), playerX - (this.pos.x + this.size.x / 2));
                    this.currentAnim.angle = this.angle;
                    this.vel.x = this.maxVel.x * Math.cos(this.angle);
                    this.vel.y = this.maxVel.y * Math.sin(this.angle);
                }
            }
            this.parent();
        },
        handleMovementTrace: function (res) {
            if (res.collision.x || res.collision.y) {
                this.kill();
            }
            this.parent(res);
        },
        check: function (other) {
            if (other == ig.game.player) {
                other.receiveDamage(10, this, this.pos.x, this.pos.y);
                this.kill();
            }
        },
        kill: function () {
            if (ig.Sound.enabled) {
                ig.game.monsterdie.play();
            }
            var x = this.pos.x + this.size.x / 2;
            var y = this.pos.y + this.size.y / 2;
            var count = ig.ua.mobile ? 1 : 1;
            for (i = 0; i <= count; i++) {
                ig.game.spawnEntity(Particle_Red, x, y, {
                    flip: this.flip,
                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_Red, x, y, {
                    flip: this.flip,
                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_DarkRed, x, y, {
                    flip: this.flip,
                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_DarkRed, x, y, {
                    flip: this.flip,
                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                });
            }
            count = ig.ua.mobile ? 0 : 0;
            for (i = 0; i <= count; i++) {
                ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                    flip: this.flip,
                    velx: -Math.floor(Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                    flip: this.flip,
                    velx: Math.floor(Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
            }
            ig.game.spawnEntity(ExplosionEffect, this.pos.x + this.size.x / 2 - 30, this.pos.y + (this.size.y / 2) - 30, {
                owner: this.owner
            });
            ig.game.spawnEntity(EntityTimeBonus, this.pos.x + this.size.x / 2 - 16, this.pos.y + (this.size.y / 2) - 16);
            ig.game.removeEntity(this);
        },
        receiveDamage: function (amount, from, x, y) {
            if (this.inittimer.delta() < 0) {
                from.kill();
            } else {
                if (!ig.game.levelcomplete) {
                    if (this.hurttimer.delta() > 0) {
                        this.health -= amount;
                        this.hurttimer.reset();
                        if (this.health <= 0) {
                            this.kill();
                        } else {
                            var count = ig.ua.mobile ? 1 : 1;
                            for (i = 0; i <= count; i++) {
                                ig.game.spawnEntity(Particle_Red, x, y, {
                                    flip: this.flip,
                                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                                });
                                ig.game.spawnEntity(Particle_Red, x, y, {
                                    flip: this.flip,
                                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                                });
                                ig.game.spawnEntity(Particle_DarkRed, x, y, {
                                    flip: this.flip,
                                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                                });
                                ig.game.spawnEntity(Particle_DarkRed, x, y, {
                                    flip: this.flip,
                                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                                });
                            }
                            count = ig.ua.mobile ? 0 : 0;
                            for (i = 0; i <= count; i++) {
                                ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                                    flip: this.flip,
                                    velx: -Math.floor(Math.random() * this.maxVel.x / 4),
                                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                                });
                                ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                                    flip: this.flip,
                                    velx: Math.floor(Math.random() * this.maxVel.x / 4),
                                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                                });
                            }
                        }
                    }
                }
            }
        },
        collideWith: function (other, axis) {
            if (other.collides == ig.Entity.COLLIDES.FIXED && this.touches(other)) {
                this.kill();
            }
        }
    });
    EntityEnemydrone2 = EntityEnemydrone1.extend({
        shoottimer: null,
        health: null,
        animSheet: new ig.AnimationSheet('media/enemy-drone2.png', 64, 32),
        maxVel: {
            x: 75,
            y: 75
        },
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.zIndex = 1;
            this.addAnim('attack', .2, [2]);
            this.addAnim('idle', .2, [0, 1]);
            this.vel.x = 0;
            this.vel.y = 0;
            this.health = 30;
            this.inittimer.reset();
            this.shoottimer = new ig.Timer(1);
            this.hurttimer = new ig.Timer(this.hurtspacing);
        },
        update: function () {
            if (this.shoottimer.delta() < -.8) {
                this.currentAnim = this.anims.attack;
            } else {
                this.currentAnim = this.anims.idle;
            }
            if (ig.game.player) {
                if (this.distanceTo(ig.game.player) < 600) {
                    var playerX = ig.game.player.pos.x + ig.game.player.size.x / 2;
                    var playerY = ig.game.player.pos.y + ig.game.player.size.y / 2;
                    this.angle = Math.atan2(playerY - (this.pos.y + this.size.y / 2), playerX - (this.pos.x + this.size.x / 2));
                    this.currentAnim.angle = this.angle;
                    this.vel.x = this.maxVel.x * Math.cos(this.angle);
                    this.vel.y = this.maxVel.y * Math.sin(this.angle);
                }
                if (this.shoottimer.delta() >= 0) {
                    var shotX = this.pos.x + this.size.x / 2 * Math.cos(this.angle) - 5;
                    var shotY = this.pos.y + this.size.y / 2 * Math.sin(this.angle) - 5;
                    ig.game.spawnEntity(EntityWeaponEnemy, shotX, shotY, {
                        flip: this.flip,
                        owner: 'bot',
                        angle: this.angle
                    });
                    this.shoottimer.reset();
                }
            }
            this.parent();
        }
    });
    EntityEnemydrone3 = EntityEnemydrone1.extend({
        shoottimer: null,
        health: null,
        animSheet: new ig.AnimationSheet('media/enemy-drone3.png', 64, 32),
        maxVel: {
            x: 125,
            y: 125
        },
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.zIndex = 1;
            this.addAnim('idle', .1, [0, 1]);
            this.vel.x = 0;
            this.vel.y = 0;
            this.health = 5;
            this.inittimer.reset();
            this.hurttimer = new ig.Timer(this.hurtspacing);
        }
    });
    EntityEnemydrone4 = EntityEnemydrone1.extend({
        shoottimer: null,
        health: null,
        size: {
            x: 42,
            y: 44
        },
        offset: {
            x: 22,
            y: 0
        },
        animSheet: new ig.AnimationSheet('media/enemy-drone4.png', 64, 44),
        maxVel: {
            x: 50,
            y: 50
        },
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.zIndex = 1;
            this.addAnim('idle', .1, [0, 1]);
            this.vel.x = 0;
            this.vel.y = 0;
            this.health = 70;
            this.inittimer.reset();
            this.hurttimer = new ig.Timer(this.hurtspacing);
        }
    });
});

// lib/game/entities/enemyfixed1.js
ig.baked = true;
ig.module('game.entities.enemyfixed1').requires('impact.entity').defines(function () {
    EntityEnemyfixed1 = ig.Entity.extend({
        size: {
            x: 32,
            y: 32
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 200,
            y: 200
        },
        friction: {
            x: 0,
            y: 0
        },
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        zIndex: 1,
        flip: false,
        accelGround: 600,
        accelAir: 600,
        bounciness: 0,
        health: 10,
        hurttimer: null,
        hurtspacing: .1,
        gravityFactor: 0,
        angle: 0,
        initialize: false,
        name: null,
        animSheet: new ig.AnimationSheet('media/enemy-fixed1.png', 32, 32),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.zIndex = 1;
            this.addAnim('idle', .2, [0]);
            this.name = 'turret' + this.pos.x + this.pos.y;
            this.vel.x = 0;
            this.vel.y = 0;
            this.hurttimer = new ig.Timer(this.hurtspacing);
        },
        update: function () {
            if (!this.initialize) {
                if (ig.game.collisionMap.getTile(this.pos.x + (this.size.x / 2), this.pos.y + this.size.y + 1)) {}
                if (ig.game.collisionMap.getTile(this.pos.x + (this.size.x / 2), this.pos.y - 1)) {
                    this.currentAnim.angle = Math.PI;
                }
                if (ig.game.collisionMap.getTile(this.pos.x - 1, this.pos.y + this.size.y / 2)) {
                    this.currentAnim.angle = Math.PI / 2;
                }
                if (ig.game.collisionMap.getTile(this.pos.x + this.size.x + 1, this.pos.y + this.size.y / 2)) {
                    this.currentAnim.angle = -Math.PI / 2;
                }
                this.name = 'turret' + this.pos.x + this.pos.y;
                ig.game.spawnEntity(EntityEnemyfixed1eye, this.pos.x, this.pos.y, {
                    basename: this.name
                });
                this.initialize = true;
            }
            this.parent();
        },
        handleMovementTrace: function (res) {
            this.parent(res);
            if (res.collision.x || res.collision.y) {
                this.kill();
            }
        },
        check: function (other) {
            if (other == ig.game.player) {
                other.receiveDamage(10, this, this.pos.x, this.pos.y);
            }
            this.kill();
        },
        kill: function () {
            ig.game.removeEntity(this);
        },
        receiveDamage: function (amount, from, x, y) {
            this.health = this.health;
        },
        collideWith: function (other, axis) {
            if (other.collides == ig.Entity.COLLIDES.FIXED && this.touches(other)) {
                var overlap;
                var size;
                if (axis == 'y') {
                    size = this.size.y;
                    if (this.pos.y < other.pos.y) overlap = this.pos.y + this.size.y - other.pos.y;
                    else overlap = this.pos.y - (other.pos.y + other.size.y);
                } else {
                    size = this.size.x;
                    if (this.pos.x < other.pos.x) overlap = this.pos.x + this.size.x - other.pos.x;
                    else overlap = this.pos.x - (other.pos.x + other.size.x);
                }
                overlap = Math.abs(overlap);
                if (overlap > 1) {
                    this.receiveDamage(100, other, this.pos.x, this.pos.y);
                }
            }
        }
    });
    EntityEnemyfixed1eye = ig.Entity.extend({
        size: {
            x: 32,
            y: 32
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 200,
            y: 200
        },
        friction: {
            x: 0,
            y: 0
        },
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        zIndex: 1,
        flip: false,
        accelGround: 600,
        accelAir: 600,
        bounciness: 0,
        health: 10,
        hurttimer: null,
        hurtspacing: .1,
        inittimer: new ig.Timer(.4),
        gravityFactor: 0,
        angle: 0,
        basename: null,
        animSheet: new ig.AnimationSheet('media/enemy-fixed1-eye.png', 32, 32),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.zIndex = 1;
            this.addAnim('idle', .2, [0, 1]);
            this.vel.x = 0;
            this.vel.y = 0;
            this.basename = settings.basename;
            this.inittimer.reset();
            this.hurttimer = new ig.Timer(this.hurtspacing);
        },
        update: function () {
            if (ig.game.player) {
                if (this.distanceTo(ig.game.player) < 600) {
                    var playerX = ig.game.player.pos.x + ig.game.player.size.x / 2;
                    var playerY = ig.game.player.pos.y + ig.game.player.size.y / 2;
                    this.angle = Math.atan2(playerY - (this.pos.y + this.size.y / 2), playerX - (this.pos.x + this.size.x / 2));
                    this.currentAnim.angle = this.angle;
                }
            } else {
                this.angle += (Math.PI / 2) / 45;
                this.currentAnim.angle = this.angle;
            }
            this.parent();
        },
        handleMovementTrace: function (res) {
            this.parent(res);
            if (res.collision.x || res.collision.y) {
                this.kill();
            }
        },
        check: function (other) {
            if (other == ig.game.player) {
                other.receiveDamage(10, this, this.pos.x, this.pos.y);
            }
            this.kill();
        },
        kill: function () {
            if (ig.Sound.enabled) {
                ig.game.monsterdie.play();
            }
            var x = this.pos.x + this.size.x / 2;
            var y = this.pos.y + this.size.y / 2;
            var count = ig.ua.mobile ? 1 : 1;
            for (i = 0; i <= count; i++) {
                ig.game.spawnEntity(Particle_Red, x, y, {
                    flip: this.flip,
                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_Red, x, y, {
                    flip: this.flip,
                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_DarkRed, x, y, {
                    flip: this.flip,
                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_DarkRed, x, y, {
                    flip: this.flip,
                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                });
            }
            count = ig.ua.mobile ? 0 : 0;
            for (i = 0; i <= count; i++) {
                ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                    flip: this.flip,
                    velx: -Math.floor(Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                    flip: this.flip,
                    velx: Math.floor(Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
            }
            ig.game.spawnEntity(ExplosionEffect, this.pos.x + this.size.x / 2 - 30, this.pos.y + (this.size.y / 2) - 30, {
                owner: this.owner
            });
            var turret = ig.game.getEntityByName(this.basename);
            if (turret) {
                ig.game.removeEntity(turret);
            }
            ig.game.spawnEntity(EntityTimeBonus, this.pos.x + this.size.x / 2 - 16, this.pos.y + (this.size.y / 2) - 16);
            ig.game.removeEntity(this);
        },
        receiveDamage: function (amount, from, x, y) {
            if (!ig.game.levelcomplete) {
                if (this.hurttimer.delta() > 0) {
                    this.health -= amount;
                    this.hurttimer.reset();
                    if (this.health <= 0) {
                        this.kill();
                    } else {
                        var count = ig.ua.mobile ? 1 : 1;
                        for (i = 0; i <= count; i++) {
                            ig.game.spawnEntity(Particle_Red, x, y, {
                                flip: this.flip,
                                velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(Particle_Red, x, y, {
                                flip: this.flip,
                                velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(Particle_DarkRed, x, y, {
                                flip: this.flip,
                                velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(Particle_DarkRed, x, y, {
                                flip: this.flip,
                                velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                        }
                        count = ig.ua.mobile ? 0 : 0;
                        for (i = 0; i <= count; i++) {
                            ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                                flip: this.flip,
                                velx: -Math.floor(Math.random() * this.maxVel.x / 4),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                                flip: this.flip,
                                velx: Math.floor(Math.random() * this.maxVel.x / 4),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                        }
                    }
                }
            }
        },
        collideWith: function (other, axis) {
            if (other.collides == ig.Entity.COLLIDES.FIXED && this.touches(other)) {
                var overlap;
                var size;
                if (axis == 'y') {
                    size = this.size.y;
                    if (this.pos.y < other.pos.y) overlap = this.pos.y + this.size.y - other.pos.y;
                    else overlap = this.pos.y - (other.pos.y + other.size.y);
                } else {
                    size = this.size.x;
                    if (this.pos.x < other.pos.x) overlap = this.pos.x + this.size.x - other.pos.x;
                    else overlap = this.pos.x - (other.pos.x + other.size.x);
                }
                overlap = Math.abs(overlap);
                if (overlap > 1) {
                    this.receiveDamage(100, other, this.pos.x, this.pos.y);
                }
            }
        }
    });
});

// lib/game/entities/enemyfixed2.js
ig.baked = true;
ig.module('game.entities.enemyfixed2').requires('impact.entity').defines(function () {
    EntityEnemyfixed2 = ig.Entity.extend({
        size: {
            x: 32,
            y: 32
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 200,
            y: 200
        },
        friction: {
            x: 0,
            y: 0
        },
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        zIndex: 1,
        flip: false,
        accelGround: 600,
        accelAir: 600,
        bounciness: 0,
        health: 10,
        hurttimer: null,
        hurtspacing: .1,
        gravityFactor: 0,
        angle: 0,
        initialize: false,
        name: null,
        animSheet: new ig.AnimationSheet('media/enemy-fixed2.png', 32, 32),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.zIndex = 1;
            this.addAnim('idle', .2, [0]);
            this.name = 'turret' + this.pos.x + this.pos.y;
            this.vel.x = 0;
            this.vel.y = 0;
            this.hurttimer = new ig.Timer(this.hurtspacing);
        },
        update: function () {
            if (!this.initialize) {
                var xpos = 0;
                var ypos = 0;
                if (ig.game.collisionMap.getTile(this.pos.x + (this.size.x / 2), this.pos.y + this.size.y + 1)) {
                    xpos = this.pos.x - 16;
                    ypos = this.pos.y - 32;
                }
                if (ig.game.collisionMap.getTile(this.pos.x + (this.size.x / 2), this.pos.y - 1)) {
                    this.currentAnim.angle = Math.PI;
                    xpos = this.pos.x - 16;
                    ypos = this.pos.y;
                }
                if (ig.game.collisionMap.getTile(this.pos.x - 1, this.pos.y + this.size.y / 2)) {
                    this.currentAnim.angle = Math.PI / 2;
                    xpos = this.pos.x;
                    ypos = this.pos.y - 16;
                }
                if (ig.game.collisionMap.getTile(this.pos.x + this.size.x + 1, this.pos.y + this.size.y / 2)) {
                    this.currentAnim.angle = -Math.PI / 2;
                    xpos = this.pos.x - 32;
                    ypos = this.pos.y - 16;
                }
                this.name = 'turret' + this.pos.x + this.pos.y;
                ig.game.spawnEntity(EntityEnemyfixed2turret, xpos, ypos, {
                    basename: this.name
                });
                this.initialize = true;
            }
            this.parent();
        },
        handleMovementTrace: function (res) {
            this.parent(res);
            if (res.collision.x || res.collision.y) {
                this.kill();
            }
        },
        check: function (other) {
            if (other == ig.game.player) {
                other.receiveDamage(10, this, this.pos.x, this.pos.y);
            }
        },
        kill: function () {
            ig.game.removeEntity(this);
        },
        receiveDamage: function (amount, from, x, y) {
            this.health = this.health;
        },
        collideWith: function (other, axis) {
            if (other.collides == ig.Entity.COLLIDES.FIXED && this.touches(other)) {
                var overlap;
                var size;
                if (axis == 'y') {
                    size = this.size.y;
                    if (this.pos.y < other.pos.y) overlap = this.pos.y + this.size.y - other.pos.y;
                    else overlap = this.pos.y - (other.pos.y + other.size.y);
                } else {
                    size = this.size.x;
                    if (this.pos.x < other.pos.x) overlap = this.pos.x + this.size.x - other.pos.x;
                    else overlap = this.pos.x - (other.pos.x + other.size.x);
                }
                overlap = Math.abs(overlap);
                if (overlap > 1) {
                    this.receiveDamage(100, other, this.pos.x, this.pos.y);
                }
            }
        }
    });
    EntityEnemyfixed2turret = ig.Entity.extend({
        size: {
            x: 64,
            y: 64
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 200,
            y: 200
        },
        friction: {
            x: 0,
            y: 0
        },
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        zIndex: 1,
        flip: false,
        accelGround: 600,
        accelAir: 600,
        bounciness: 0,
        health: 20,
        hurttimer: null,
        hurtspacing: .1,
        inittimer: new ig.Timer(.4),
        gravityFactor: 0,
        angle: 0,
        name: null,
        basename: null,
        weaponenable: null,
        attacktimer: null,
        animSheet: new ig.AnimationSheet('media/enemy-fixed2-turret.png', 64, 64),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.zIndex = 1;
            this.addAnim('idle', .2, [0]);
            this.vel.x = 0;
            this.vel.y = 0;
            this.basename = settings.basename;
            this.inittimer.reset();
            this.attacktimer = new ig.Timer(1), this.hurttimer = new ig.Timer(this.hurtspacing);
        },
        update: function () {
            if (ig.game.player) {
                if (this.distanceTo(ig.game.player) < 600) {
                    var playerX = ig.game.player.pos.x + ig.game.player.size.x / 2;
                    var playerY = ig.game.player.pos.y + ig.game.player.size.y / 2;
                    this.angle = Math.atan2(playerY - (this.pos.y + this.size.y / 2), playerX - (this.pos.x + this.size.x / 2));
                    this.currentAnim.angle = this.angle;
                    if (this.attacktimer.delta() > 0) {
                        var x = this.pos.x + this.size.x / 2;
                        var y = this.pos.y + this.size.y / 2;
                        var res = ig.game.collisionMap.trace(x, y, ig.game.player.pos.x + (ig.game.player.size.x / 2) - x, ig.game.player.pos.y + (ig.game.player.size.y / 2) - y, 10, 10);
                        if (!res.collision.x && !res.collision.y) {
                            var shotX = this.pos.x + this.size.x / 2 + (48 * Math.cos(this.angle));
                            var shotY = this.pos.y + this.size.y / 2 + (48 * Math.sin(this.angle)) - 5;
                            var casingX = this.pos.x + this.size.x / 2 + (20 * Math.cos(this.angle + Math.PI));
                            var casingY = this.pos.y + this.size.y / 2 + (20 * Math.sin(this.angle + Math.PI)) - 5;
                            ig.game.spawnEntity(EntityEnemyGunFlare, this.pos.x + this.size.x / 2 - 32 - 21, this.pos.y + this.size.y / 2 - 32 - 21, {
                                flip: this.flip,
                                posx: this.pos.x,
                                posy: this.pos.y,
                                velx: this.vel.x,
                                vely: this.vel.y,
                                angle: this.angle
                            });
                            ig.game.spawnEntity(EntityWeaponEnemy, shotX, shotY, {
                                flip: this.flip,
                                owner: 'bot',
                                angle: this.angle
                            });
                        }
                        this.attacktimer.reset();
                    }
                }
            } else {
                this.angle += (Math.PI / 2) / 45;
                this.currentAnim.angle = this.angle;
            }
            this.parent();
        },
        handleMovementTrace: function (res) {
            this.parent(res);
            if (res.collision.x || res.collision.y) {
                this.kill();
            }
        },
        check: function (other) {
            if (other == ig.game.player) {
                other.receiveDamage(10, this, this.pos.x, this.pos.y);
            }
        },
        kill: function () {
            if (ig.Sound.enabled) {
                ig.game.monsterdie.play();
            }
            var x = this.pos.x + this.size.x / 2;
            var y = this.pos.y + this.size.y / 2;
            var count = ig.ua.mobile ? 1 : 1;
            for (i = 0; i <= count; i++) {
                ig.game.spawnEntity(Particle_Red, x, y, {
                    flip: this.flip,
                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_Red, x, y, {
                    flip: this.flip,
                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_DarkRed, x, y, {
                    flip: this.flip,
                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_DarkRed, x, y, {
                    flip: this.flip,
                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                });
            }
            count = ig.ua.mobile ? 0 : 0;
            for (i = 0; i <= count; i++) {
                ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                    flip: this.flip,
                    velx: -Math.floor(Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                    flip: this.flip,
                    velx: Math.floor(Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
            }
            ig.game.spawnEntity(ExplosionLargeEffect, this.pos.x + this.size.x / 2 - 90, this.pos.y + (this.size.y / 2) - 90, {
                owner: this
            });
            var turret = ig.game.getEntityByName(this.basename);
            if (turret) {
                ig.game.removeEntity(turret);
            }
            ig.game.spawnEntity(EntityTimeBonus, this.pos.x + this.size.x / 2 - 16, this.pos.y + (this.size.y / 2) - 16);
            ig.game.removeEntity(this);
        },
        receiveDamage: function (amount, from, x, y) {
            if (!ig.game.levelcomplete) {
                if (this.hurttimer.delta() > 0) {
                    this.health -= amount;
                    this.hurttimer.reset();
                    if (this.health <= 0) {
                        this.kill();
                    } else {
                        var count = ig.ua.mobile ? 1 : 1;
                        for (i = 0; i <= count; i++) {
                            ig.game.spawnEntity(Particle_Red, x, y, {
                                flip: this.flip,
                                velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(Particle_Red, x, y, {
                                flip: this.flip,
                                velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(Particle_DarkRed, x, y, {
                                flip: this.flip,
                                velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(Particle_DarkRed, x, y, {
                                flip: this.flip,
                                velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                        }
                        count = ig.ua.mobile ? 0 : 0;
                        for (i = 0; i <= count; i++) {
                            ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                                flip: this.flip,
                                velx: -Math.floor(Math.random() * this.maxVel.x / 4),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                                flip: this.flip,
                                velx: Math.floor(Math.random() * this.maxVel.x / 4),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                        }
                    }
                }
            }
        },
        collideWith: function (other, axis) {
            if (other.collides == ig.Entity.COLLIDES.FIXED && this.touches(other)) {
                var overlap;
                var size;
                if (axis == 'y') {
                    size = this.size.y;
                    if (this.pos.y < other.pos.y) overlap = this.pos.y + this.size.y - other.pos.y;
                    else overlap = this.pos.y - (other.pos.y + other.size.y);
                } else {
                    size = this.size.x;
                    if (this.pos.x < other.pos.x) overlap = this.pos.x + this.size.x - other.pos.x;
                    else overlap = this.pos.x - (other.pos.x + other.size.x);
                }
                overlap = Math.abs(overlap);
                if (overlap > 1) {
                    this.receiveDamage(100, other, this.pos.x, this.pos.y);
                }
            }
        }
    });
});

// lib/game/entities/enemyfixed3.js
ig.baked = true;
ig.module('game.entities.enemyfixed3').requires('impact.entity').defines(function () {
    EntityEnemyfixed3 = ig.Entity.extend({
        size: {
            x: 60,
            y: 60
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 40,
            y: 40
        },
        friction: {
            x: 0,
            y: 0
        },
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        zIndex: 1,
        flip: false,
        accelGround: 600,
        accelAir: 600,
        bounciness: 0,
        health: 10,
        hurttimer: null,
        hurtspacing: .1,
        gravityFactor: 0,
        angle: 0,
        initialize: false,
        name: null,
        animSheet: new ig.AnimationSheet('media/enemy-fixed3.png', 60, 60),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.zIndex = 1;
            this.addAnim('idle', .2, [1]);
            this.addAnim('attack', .1, [0, 1]);
            this.vel.x = 0;
            this.vel.y = 0;
            this.hurttimer = new ig.Timer(this.hurtspacing);
            this.currentAnim = this.anims.idle;
        },
        update: function () {
            if (ig.game.player) {
                if (this.distanceTo(ig.game.player) < 600) {
                    var playerX = ig.game.player.pos.x + ig.game.player.size.x / 2;
                    var playerY = ig.game.player.pos.y + ig.game.player.size.y / 2;
                    this.angle = Math.atan2(playerY - (this.pos.y + this.size.y / 2), playerX - (this.pos.x + this.size.x / 2));
                    var x = this.pos.x + this.size.x / 2;
                    var y = this.pos.y + this.size.y / 2;
                    var res = ig.game.collisionMap.trace(x, y, ig.game.player.pos.x + (ig.game.player.size.x / 2) - x, ig.game.player.pos.y + (ig.game.player.size.y / 2) - y, 10, 10);
                    if (!res.collision.x && !res.collision.y) {
                        this.vel.x = this.maxVel.x * Math.cos(this.angle);
                        this.vel.y = this.maxVel.y * Math.sin(this.angle);
                        this.currentAnim = this.anims.attack;
                        this.currentAnim.angle = this.angle;
                    } else {
                        this.vel.x = 0;
                        this.vel.y = 0;
                        this.currentAnim = this.anims.idle;
                    }
                }
            } else {
                this.vel.x = 0;
                this.vel.y = 0;
            }
            this.parent();
        },
        handleMovementTrace: function (res) {
            this.parent(res);
            if (res.collision.x || res.collision.y) {
                this.kill();
            }
        },
        check: function (other) {
            if (other == ig.game.player) {
                other.receiveDamage(50, this, this.pos.x, this.pos.y);
                this.kill();
            }
        },
        kill: function () {
            if (ig.Sound.enabled) {
                ig.game.monsterdie.play();
            }
            var x = this.pos.x + this.size.x / 2;
            var y = this.pos.y + this.size.y / 2;
            var count = ig.ua.mobile ? 1 : 1;
            for (i = 0; i <= count; i++) {
                ig.game.spawnEntity(Particle_Red, x, y, {
                    flip: this.flip,
                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_Red, x, y, {
                    flip: this.flip,
                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_DarkRed, x, y, {
                    flip: this.flip,
                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_DarkRed, x, y, {
                    flip: this.flip,
                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                });
            }
            count = ig.ua.mobile ? 0 : 0;
            for (i = 0; i <= count; i++) {
                ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                    flip: this.flip,
                    velx: -Math.floor(Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                    flip: this.flip,
                    velx: Math.floor(Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
            }
            ig.game.spawnEntity(ExplosionLargeEffect, this.pos.x + this.size.x / 2 - 90, this.pos.y + (this.size.y / 2) - 90, {
                owner: this.owner
            });
            ig.game.spawnEntity(EntityTimeBonus, this.pos.x + this.size.x / 2 - 16, this.pos.y + (this.size.y / 2) - 16);
            ig.game.removeEntity(this);
        },
        receiveDamage: function (amount, from, x, y) {
            if (!ig.game.levelcomplete) {
                if (this.hurttimer.delta() > 0) {
                    this.health -= amount;
                    this.hurttimer.reset();
                    if (this.health <= 0) {
                        this.kill();
                    } else {
                        var count = ig.ua.mobile ? 1 : 1;
                        for (i = 0; i <= count; i++) {
                            ig.game.spawnEntity(Particle_Red, x, y, {
                                flip: this.flip,
                                velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(Particle_Red, x, y, {
                                flip: this.flip,
                                velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(Particle_DarkRed, x, y, {
                                flip: this.flip,
                                velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(Particle_DarkRed, x, y, {
                                flip: this.flip,
                                velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                        }
                        count = ig.ua.mobile ? 0 : 0;
                        for (i = 0; i <= count; i++) {
                            ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                                flip: this.flip,
                                velx: -Math.floor(Math.random() * this.maxVel.x / 4),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                                flip: this.flip,
                                velx: Math.floor(Math.random() * this.maxVel.x / 4),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                        }
                    }
                }
            }
        },
        collideWith: function (other, axis) {
            if (other.collides == ig.Entity.COLLIDES.FIXED && this.touches(other)) {
                var overlap;
                var size;
                if (axis == 'y') {
                    size = this.size.y;
                    if (this.pos.y < other.pos.y) overlap = this.pos.y + this.size.y - other.pos.y;
                    else overlap = this.pos.y - (other.pos.y + other.size.y);
                } else {
                    size = this.size.x;
                    if (this.pos.x < other.pos.x) overlap = this.pos.x + this.size.x - other.pos.x;
                    else overlap = this.pos.x - (other.pos.x + other.size.x);
                }
                overlap = Math.abs(overlap);
                if (overlap > 1) {
                    this.receiveDamage(100, other, this.pos.x, this.pos.y);
                }
            }
        }
    });
});

// lib/game/entities/enemyfixed4.js
ig.baked = true;
ig.module('game.entities.enemyfixed4').requires('impact.entity').defines(function () {
    EntityEnemyfixed4 = ig.Entity.extend({
        size: {
            x: 44,
            y: 32
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 200,
            y: 200
        },
        friction: {
            x: 0,
            y: 0
        },
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        zIndex: 1,
        flip: false,
        accelGround: 600,
        accelAir: 600,
        bounciness: 0,
        health: 10,
        hurttimer: null,
        hurtspacing: .1,
        gravityFactor: 0,
        angle: 0,
        initialize: false,
        name: null,
        animSheet: new ig.AnimationSheet('media/enemy-fixed4.png', 44, 32),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.zIndex = 1;
            this.addAnim('idle', .2, [0, 1]);
            this.vel.x = 0;
            this.vel.y = 0;
            this.hurttimer = new ig.Timer(this.hurtspacing);
        },
        update: function () {
            if (!this.initialize) {
                if (ig.game.collisionMap.getTile(this.pos.x + (this.size.x / 2), this.pos.y + this.size.y + 1)) {}
                if (ig.game.collisionMap.getTile(this.pos.x + (this.size.x / 2), this.pos.y - 1)) {
                    this.currentAnim.angle = Math.PI;
                }
                if (ig.game.collisionMap.getTile(this.pos.x - 1, this.pos.y + this.size.y / 2)) {
                    this.currentAnim.angle = Math.PI / 2;
                    this.size.x = 32;
                    this.size.y = 44;
                    this.pos.x = this.pos.x - 6;
                }
                if (ig.game.collisionMap.getTile(this.pos.x + this.size.x + 1, this.pos.y + this.size.y / 2)) {
                    this.currentAnim.angle = -Math.PI / 2;
                    this.size.x = 32;
                    this.size.y = 44;
                    this.pos.x = this.pos.x + 6;
                }
                this.initialize = true;
            }
            this.parent();
        },
        handleMovementTrace: function (res) {
            this.parent(res);
            if (res.collision.x || res.collision.y) {
                this.kill();
            }
        },
        check: function (other) {
            if (other == ig.game.player) {
                other.receiveDamage(25, this, this.pos.x, this.pos.y);
            }
            this.kill();
        },
        kill: function () {
            if (ig.Sound.enabled) {
                ig.game.monsterdie.play();
            }
            var x = this.pos.x + this.size.x / 2;
            var y = this.pos.y + this.size.y / 2;
            var count = ig.ua.mobile ? 1 : 1;
            for (i = 0; i <= count; i++) {
                ig.game.spawnEntity(Particle_Red, x, y, {
                    flip: this.flip,
                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_Red, x, y, {
                    flip: this.flip,
                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_DarkRed, x, y, {
                    flip: this.flip,
                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_DarkRed, x, y, {
                    flip: this.flip,
                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                });
            }
            count = ig.ua.mobile ? 0 : 0;
            for (i = 0; i <= count; i++) {
                ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                    flip: this.flip,
                    velx: -Math.floor(Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                    flip: this.flip,
                    velx: Math.floor(Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
            }
            ig.game.spawnEntity(ExplosionLargeEffect, this.pos.x + this.size.x / 2 - 90, this.pos.y + (this.size.y / 2) - 90, {
                owner: this.owner
            });
            var turret = ig.game.getEntityByName(this.basename);
            if (turret) {
                ig.game.removeEntity(turret);
            }
            ig.game.spawnEntity(EntityTimeBonus, this.pos.x + this.size.x / 2 - 16, this.pos.y + (this.size.y / 2) - 16);
            ig.game.removeEntity(this);
        },
        receiveDamage: function (amount, from, x, y) {
            if (!ig.game.levelcomplete) {
                if (this.hurttimer.delta() > 0) {
                    this.health -= amount;
                    this.hurttimer.reset();
                    if (this.health <= 0) {
                        this.kill();
                    } else {
                        var count = ig.ua.mobile ? 1 : 1;
                        for (i = 0; i <= count; i++) {
                            ig.game.spawnEntity(Particle_Red, x, y, {
                                flip: this.flip,
                                velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(Particle_Red, x, y, {
                                flip: this.flip,
                                velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(Particle_DarkRed, x, y, {
                                flip: this.flip,
                                velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(Particle_DarkRed, x, y, {
                                flip: this.flip,
                                velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                        }
                        count = ig.ua.mobile ? 0 : 0;
                        for (i = 0; i <= count; i++) {
                            ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                                flip: this.flip,
                                velx: -Math.floor(Math.random() * this.maxVel.x / 4),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                                flip: this.flip,
                                velx: Math.floor(Math.random() * this.maxVel.x / 4),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                        }
                    }
                }
            }
        },
        collideWith: function (other, axis) {
            if (other.collides == ig.Entity.COLLIDES.FIXED && this.touches(other)) {
                var overlap;
                var size;
                if (axis == 'y') {
                    size = this.size.y;
                    if (this.pos.y < other.pos.y) overlap = this.pos.y + this.size.y - other.pos.y;
                    else overlap = this.pos.y - (other.pos.y + other.size.y);
                } else {
                    size = this.size.x;
                    if (this.pos.x < other.pos.x) overlap = this.pos.x + this.size.x - other.pos.x;
                    else overlap = this.pos.x - (other.pos.x + other.size.x);
                }
                overlap = Math.abs(overlap);
                if (overlap > 1) {
                    this.receiveDamage(100, other, this.pos.x, this.pos.y);
                }
            }
        }
    });
});

// lib/game/entities/enemyboss1.js
ig.baked = true;
ig.module('game.entities.enemyboss1').requires('impact.entity').defines(function () {
    EntityEnemyboss1 = ig.Entity.extend({
        size: {
            x: 200,
            y: 200
        },
        offset: {
            x: 28,
            y: 28
        },
        maxVel: {
            x: 100,
            y: 100
        },
        friction: {
            x: 0,
            y: 0
        },
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        zIndex: 1,
        flip: false,
        accelGround: 600,
        accelAir: 600,
        bounciness: 0,
        health: 3000,
        hurttimer: null,
        hurtspacing: .1,
        gravityFactor: 0,
        angle: 0,
        initialize: false,
        name: null,
        target: null,
        targets: [],
        currentTarget: 0,
        time: 3,
        enemy: 'EntityEnemyfixed3',
        speed: 1,
        animSheet: new ig.AnimationSheet('media/enemy-boss1.png', 256, 256),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.zIndex = 10;
            this.addAnim('idle', .05, [0, 1, 2]);
            this.vel.x = 0;
            this.vel.y = 0;
            this.hurttimer = new ig.Timer(this.hurtspacing);
            this.spawntimer1 = new ig.Timer(this.time);
            this.spawntimer2 = new ig.Timer(this.time * 2);
            this.spawntimer3 = new ig.Timer(this.time * 3);
            this.spawntimer4 = new ig.Timer(this.time * 4);
            this.spawntimer5 = new ig.Timer(this.time * 5);
            if (this.target) {
                this.targets = ig.ksort(this.target);
            }
            this.directionchange = new ig.Timer(5);
        },
        update: function () {
            if (ig.game.player) {
                if (this.distanceTo(ig.game.player) < 1000) {
                    var playerX = ig.game.player.pos.x + ig.game.player.size.x / 2;
                    var playerY = ig.game.player.pos.y + ig.game.player.size.y / 2;
                    this.angle = Math.atan2(playerY - (this.pos.y + this.size.y / 2), playerX - (this.pos.x + this.size.x / 2));
                    this.currentAnim.angle = this.angle;
                    var x = this.pos.x + this.size.x / 2;
                    var y = this.pos.y + this.size.y / 2;
                    var res = ig.game.collisionMap.trace(x, y, ig.game.player.pos.x + (ig.game.player.size.x / 2) - x, ig.game.player.pos.y + (ig.game.player.size.y / 2) - y, 10, 10);
                    if (!res.collision.x && !res.collision.y) {
                        travelregion = ig.game.getEntityByName('boss1');
                        if (this.touches(travelregion)) {
                            this.speed = this.speed;
                        } else {
                            if (this.directionchange.delta() > 0) {
                                this.speed = -this.speed;
                                this.directionchange.set(5);
                            }
                        }
                        this.vel.x = this.maxVel.x * this.speed;
                        if (this.spawntimer1.delta() >= 0) {
                            ig.game.spawnEntity(EntityWarpEnemyEffect, this.pos.x + this.size.x / 2 - 30, this.pos.y + this.size.y / 2 - 30, {
                                velx: this.vel.x,
                                vely: this.vel.y
                            });
                            ig.game.spawnEntity('EntityEnemyfixed3', this.pos.x + this.size.x / 2 - 16, this.pos.y + this.size.y / 2 - 16);
                            this.spawntimer1.set(this.time);
                        }
                        if (this.spawntimer2.delta() >= 0) {
                            ig.game.spawnEntity(EntityWarpEnemyEffect, this.pos.x + this.size.x / 2 - 30, this.pos.y + this.size.y / 2 - 30, {
                                velx: this.vel.x,
                                vely: this.vel.y
                            });
                            ig.game.spawnEntity('EntityEnemydrone1', this.pos.x + this.size.x / 2 - 16, this.pos.y + this.size.y / 2 - 16);
                            this.spawntimer2.set(this.time * 2);
                        }
                        if (this.spawntimer3.delta() >= 0) {
                            ig.game.spawnEntity(EntityWarpEnemyEffect, this.pos.x + this.size.x / 2 - 30, this.pos.y + this.size.y / 2 - 30, {
                                velx: this.vel.x,
                                vely: this.vel.y
                            });
                            ig.game.spawnEntity('EntityEnemydrone2', this.pos.x + this.size.x / 2 - 16, this.pos.y + this.size.y / 2 - 16);
                            this.spawntimer3.set(this.time * 3);
                        }
                        if (this.spawntimer4.delta() >= 0) {
                            ig.game.spawnEntity(EntityWarpEnemyEffect, this.pos.x + this.size.x / 2 - 30, this.pos.y + this.size.y / 2 - 30, {
                                velx: this.vel.x,
                                vely: this.vel.y
                            });
                            ig.game.spawnEntity('EntityEnemydrone3', this.pos.x + this.size.x / 2 - 16, this.pos.y + this.size.y / 2 - 16);
                            this.spawntimer4.set(this.time * 4);
                        }
                        if (this.spawntimer5.delta() >= 0) {
                            ig.game.spawnEntity(EntityWarpEnemyEffect, this.pos.x + this.size.x / 2 - 30, this.pos.y + this.size.y / 2 - 30, {
                                velx: this.vel.x,
                                vely: this.vel.y
                            });
                            ig.game.spawnEntity('EntityEnemydrone4', this.pos.x + this.size.x / 2 - 16, this.pos.y + this.size.y / 2 - 16);
                            this.spawntimer5.set(this.time * 5);
                        }
                    } else {
                        this.vel.x = 0;
                        this.vel.y = 0;
                    }
                }
            } else {
                this.angle += (Math.PI / 2) / 45;
                this.currentAnim.angle = this.angle;
            }
            this.parent();
        },
        handleMovementTrace: function (res) {
            this.parent(res);
        },
        check: function (other) {
            if (other == ig.game.player) {
                other.receiveDamage(10, this, this.pos.x, this.pos.y);
            }
        },
        kill: function () {
            if (this.target) {
                if (!this.switched) {
                    var oldDistance = 0;
                    var target = ig.game.getEntityByName(this.targets[this.currentTarget]);
                    if (target) {
                        target.kill();
                    }
                }
            }
            if (ig.Sound.enabled) {
                ig.game.monsterdie.play();
            }
            var x = this.pos.x + this.size.x / 2;
            var y = this.pos.y + this.size.y / 2;
            var count = ig.ua.mobile ? 1 : 1;
            for (i = 0; i <= count; i++) {
                ig.game.spawnEntity(Particle_Red, x, y, {
                    flip: this.flip,
                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_Red, x, y, {
                    flip: this.flip,
                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_DarkRed, x, y, {
                    flip: this.flip,
                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_DarkRed, x, y, {
                    flip: this.flip,
                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                });
            }
            count = ig.ua.mobile ? 0 : 0;
            for (i = 0; i <= count; i++) {
                ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                    flip: this.flip,
                    velx: -Math.floor(Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                    flip: this.flip,
                    velx: Math.floor(Math.random() * this.maxVel.x / 4),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
            }
            ig.game.spawnEntity(ExplosionLargeEffect, this.pos.x + this.size.x / 2 - 90, this.pos.y + (this.size.y / 2) - 90, {
                owner: this.owner
            });
            ig.game.spawnEntity(ExplosionLargeEffect, this.pos.x - 90, this.pos.y - 90, {
                owner: this.owner
            });
            ig.game.spawnEntity(ExplosionLargeEffect, this.pos.x + this.size.x - 90, this.pos.y - 90, {
                owner: this.owner
            });
            ig.game.spawnEntity(ExplosionLargeEffect, this.pos.x - 90, this.pos.y + this.size.y - 90, {
                owner: this.owner
            });
            ig.game.spawnEntity(ExplosionLargeEffect, this.pos.x + this.size.x - 90, this.pos.y + this.size.y - 90, {
                owner: this.owner
            });
            ig.game.spawnEntity(EntityTimeBonus, this.pos.x + this.size.x / 2 - 16, this.pos.y + (this.size.y / 2) - 16);
            ig.game.shakestrength = 10;
            ig.game.shakescreen.set(2);
            ig.game.removeEntity(this);
        },
        receiveDamage: function (amount, from, x, y) {
            if (!ig.game.levelcomplete) {
                if (this.hurttimer.delta() > 0) {
                    this.health -= amount;
                    this.hurttimer.reset();
                    if (this.health <= 0) {
                        this.kill();
                    } else {
                        var count = ig.ua.mobile ? 1 : 1;
                        for (i = 0; i <= count; i++) {
                            ig.game.spawnEntity(Particle_Red, x, y, {
                                flip: this.flip,
                                velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(Particle_Red, x, y, {
                                flip: this.flip,
                                velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(Particle_DarkRed, x, y, {
                                flip: this.flip,
                                velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(Particle_DarkRed, x, y, {
                                flip: this.flip,
                                velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                                vely: Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                        }
                        count = ig.ua.mobile ? 0 : 0;
                        for (i = 0; i <= count; i++) {
                            ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                                flip: this.flip,
                                velx: -Math.floor(Math.random() * this.maxVel.x / 4),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                            ig.game.spawnEntity(EntityPlayerDebris, x, y, {
                                flip: this.flip,
                                velx: Math.floor(Math.random() * this.maxVel.x / 4),
                                vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                            });
                        }
                        ig.game.spawnEntity(ExplosionLargeEffect, x - 90, y - 90, {
                            owner: this.owner
                        });
                    }
                }
            }
        },
        collideWith: function (other, axis) {
            if (other.collides == ig.Entity.COLLIDES.FIXED && this.touches(other)) {
                var overlap;
                var size;
                if (axis == 'y') {
                    size = this.size.y;
                    if (this.pos.y < other.pos.y) overlap = this.pos.y + this.size.y - other.pos.y;
                    else overlap = this.pos.y - (other.pos.y + other.size.y);
                } else {
                    size = this.size.x;
                    if (this.pos.x < other.pos.x) overlap = this.pos.x + this.size.x - other.pos.x;
                    else overlap = this.pos.x - (other.pos.x + other.size.x);
                }
                overlap = Math.abs(overlap);
                if (overlap > 1) {
                    this.receiveDamage(100, other, this.pos.x, this.pos.y);
                }
            }
        }
    });
});

// lib/game/entities/hazardsawblade.js
ig.baked = true;
ig.module('game.entities.hazardsawblade').requires('impact.entity').defines(function () {
    EntityHazardsawblade = ig.Entity.extend({
        size: {
            x: 128,
            y: 128
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 100,
            y: 100
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(0, 255, 100, 0.7)',
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.BOTH,
        collides: ig.Entity.COLLIDES.PASSIVE,
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(255, 0, 100, 0.7)',
        target: null,
        targets: [],
        currentTarget: 0,
        speed: 0,
        gravityFactor: 0,
        health: 1000,
        animSheet: new ig.AnimationSheet('media/hazard-sawblade.png', 128, 128),
        init: function (x, y, settings) {
            this.zIndex = -5;
            this.addAnim('idle', .05, [0, 1, 2]);
            this.curentAnim = this.anims.idle;
            this.parent(x, y, settings);
            if (this.target) {
                this.targets = ig.ksort(this.target);
            }
        },
        update: function () {
            if (this.target) {
                var oldDistance = 0;
                var target = ig.game.getEntityByName(this.targets[this.currentTarget]);
                if (target) {
                    oldDistance = this.distanceTo(target);
                    var angle = this.angleTo(target);
                    this.vel.x = Math.cos(angle) * this.speed;
                    this.vel.y = Math.sin(angle) * this.speed;
                } else {
                    this.vel.x = 0;
                    this.vel.y = 0;
                }
                var newDistance = this.distanceTo(target);
                if (target && (newDistance > oldDistance || newDistance < 0.5)) {
                    this.pos.x = target.pos.x + target.size.x / 2 - this.size.x / 2;
                    this.pos.y = target.pos.y + target.size.y / 2 - this.size.y / 2;
                    this.currentTarget++;
                    if (this.currentTarget >= this.targets.length && this.targets.length > 1) {
                        this.currentTarget = 0;
                    }
                }
            } else {
                this.vel.x = 0;
                this.vel.y = 0;
            }
            this.parent();
        },
        check: function (other) {
            other.receiveDamage(1000, this, this.pos.x, this.pos.y);
        },
        receiveDamage: function (amount, from, x, y) {
            this.health = this.health;
        }
    });
});

// lib/game/entities/displaytext.js
ig.baked = true;
ig.module('game.entities.displaytext').requires('impact.entity').defines(function () {
    EntityDisplaytext = ig.Entity.extend({
        _wmScalable: true,
        _wmDrawBox: true,
        size: {
            x: 64,
            y: 64
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 0,
            y: 0
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(255, 0, 255, 0.5)',
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.NONE,
        gravityFactor: 0,
        name: '',
        text: '',
        zIndex: 10,
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            ig.game.displaytext = false;
        },
        update: function () {
            ig.game.displaytext = false;
        },
        check: function (other) {
            if (other == ig.game.player) {
                ig.game.displaytext = true;
                ig.game.text = this.text;
            }
        }
    });
});

// lib/game/entities/portalenter.js
ig.baked = true;
ig.module('game.entities.portalenter').requires('impact.entity').defines(function () {
    EntityPortalenter = ig.Entity.extend({
        size: {
            x: 64,
            y: 64
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 500,
            y: 500
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(0, 0, 255, 0.5)',
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        target: null,
        targets: [],
        currentTarget: 0,
        speed: 0,
        gravityFactor: 0,
        name: '',
        teleport: false,
        initialize: false,
        animSheet: new ig.AnimationSheet('media/entity-portal-enter.png', 64, 64),
        init: function (x, y, settings) {
            this.addAnim('idle', .1, [0, 1, 2, 3, 2, 1]);
            this.currentAnim = this.anims.idle;
            this.parent(x, y, settings);
            if (this.target) {
                this.targets = ig.ksort(this.target);
            }
        },
        update: function () {
            if (!this.initialize) {
                if (ig.game.collisionMap.getTile(this.pos.x + (this.size.x / 2), this.pos.y + this.size.y + 1)) {
                    ig.game.spawnEntity(EntityArrowUp, this.pos.x + this.size.x / 4, this.pos.y);
                }
                if (ig.game.collisionMap.getTile(this.pos.x + (this.size.x / 2), this.pos.y - 1)) {
                    ig.game.spawnEntity(EntityArrowDown, this.pos.x + this.size.x / 4, this.pos.y + this.size.y / 2);
                }
                if (ig.game.collisionMap.getTile(this.pos.x - 1, this.pos.y + this.size.y / 2)) {
                    ig.game.spawnEntity(EntityArrowRight, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 4);
                }
                if (ig.game.collisionMap.getTile(this.pos.x + this.size.x + 1, this.pos.y + this.size.y / 2)) {
                    ig.game.spawnEntity(EntityArrowLeft, this.pos.x, this.pos.y + this.size.y / 4);
                }
                this.initialize = true;
            }
            this.currentAnim = this.anims.idle;
            this.parent();
        },
        check: function (other) {
            if (this.target) {
                var oldDistance = 0;
                var target = ig.game.getEntityByName(this.targets[this.currentTarget]);
                if (target) {
                    if ((Math.abs((other.pos.x + other.size.x / 2) - (this.pos.x + this.size.x / 2)) < this.size.x / 2) && (Math.abs((other.pos.y + other.size.y / 2) - (this.pos.y + this.size.y / 2)) < this.size.y / 2)) {
                        ig.game.spawnEntity(EntityPortalEnterEffect, this.pos.x + this.size.x / 2 - 60, this.pos.y + this.size.y / 2 - 60);
                        ig.game.spawnEntity(EntityWarpEnterEffect, this.pos.x + 2, this.pos.y + 2);
                        other.pos.x = target.pos.x + target.size.x / 2 - other.size.x / 2;
                        other.pos.y = target.pos.y + target.size.y / 2 - other.size.y / 2;
                        if (ig.game.collisionMap.getTile(this.pos.x + (this.size.x / 2), this.pos.y + this.size.y + 1) || ig.game.collisionMap.getTile(this.pos.x + (this.size.x / 2), this.pos.y - 1)) {
                            other.vel.y = -other.vel.y;
                        }
                        if (ig.game.collisionMap.getTile(this.pos.x - 1, this.pos.y + this.size.y / 2) || ig.game.collisionMap.getTile(this.pos.x + this.size.x + 1, this.pos.y + this.size.y / 2)) {
                            other.vel.x = -other.vel.x;
                        }
                        ig.game.spawnEntity(EntityPortalExitEffect, target.pos.x + target.size.x / 2 - 60, target.pos.y + target.size.y / 2 - 60);
                        ig.game.spawnEntity(EntityWarpExitEffect, target.pos.x + 2, target.pos.y + 2);
                    }
                } else {}
            }
        },
        receiveDamage: function (amount, from, x, y) {
            this.health = this.health;
        }
    });
});

// lib/game/entities/portalexit.js
ig.baked = true;
ig.module('game.entities.portalexit').requires('impact.entity').defines(function () {
    EntityPortalexit = ig.Entity.extend({
        size: {
            x: 64,
            y: 64
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 500,
            y: 500
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(255, 0, 0, 0.5)',
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        target: null,
        targets: [],
        currentTarget: 0,
        speed: 0,
        gravityFactor: 0,
        name: '',
        animSheet: new ig.AnimationSheet('media/entity-portal-exit.png', 64, 64),
        init: function (x, y, settings) {
            this.addAnim('launch', .2, [0]);
            this.addAnim('idle', .1, [0, 1, 2, 3, 2, 1]);
            this.currentAnim = this.anims.idle;
            this.parent(x, y, settings);
            if (this.target) {
                this.targets = ig.ksort(this.target);
            }
        },
        update: function () {
            if (this.anims.launch.loopCount > 0) {
                this.currentAnim = this.anims.idle;
            }
            this.parent();
        },
        receiveDamage: function (amount, from, x, y) {
            this.health = this.health;
        }
    });
});

// lib/game/entities/portalenemy.js
ig.baked = true;
ig.module('game.entities.portalenemy').requires('impact.entity').defines(function () {
    EntityPortalenemy = ig.Entity.extend({
        size: {
            x: 64,
            y: 64
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 500,
            y: 500
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(0, 255, 100, 0.5)',
        type: ig.Entity.TYPE.B,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(255, 0, 100, 0.7)',
        target: null,
        targets: [],
        currentTarget: 0,
        speed: 0,
        gravityFactor: 0,
        name: '',
        teleport: false,
        time: 1,
        spawntimer: null,
        health: 50,
        enemy: 'EntityEnemydrone1',
        animSheet: new ig.AnimationSheet('media/entity-portal-enemy.png', 64, 64),
        init: function (x, y, settings) {
            this.addAnim('idle', .1, [0, 1, 2, 3, 2, 1]);
            this.curentAnim = this.anims.idle;
            this.parent(x, y, settings);
            if (this.target) {
                this.targets = ig.ksort(this.target);
            }
            this.spawntimer = new ig.Timer(this.time);
        },
        update: function () {
            if (ig.game.player) {
                if (this.distanceTo(ig.game.player) < 500) {
                    if (this.spawntimer.delta() >= 0) {
                        var x = this.pos.x + this.size.x / 2;
                        var y = this.pos.y + this.size.y / 2;
                        var res = ig.game.collisionMap.trace(x, y, ig.game.player.pos.x + (ig.game.player.size.x / 2) - x, ig.game.player.pos.y + (ig.game.player.size.y / 2) - y, 10, 10);
                        if (!res.collision.x && !res.collision.y) {
                            ig.game.spawnEntity(EntityWarpEnemyEffect, this.pos.x + 2, this.pos.y + 2);
                            ig.game.spawnEntity(this.enemy, this.pos.x + 16, this.pos.y + 16);
                        }
                        this.spawntimer.set(this.time);
                    }
                }
            }
            this.parent();
        },
        check: function (other) {},
        receiveDamage: function (amount, from, x, y) {
            this.health -= amount;
            if (this.health <= 0) {
                this.kill();
            } else {
                var count = ig.ua.mobile ? 1 : 1;
                for (i = 0; i <= count; i++) {
                    ig.game.spawnEntity(Particle_Orange, x, y, {
                        flip: this.flip,
                        velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                        vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                    });
                    ig.game.spawnEntity(Particle_Orange, x, y, {
                        flip: this.flip,
                        velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                        vely: Math.floor(Math.random() * this.maxVel.y / 2)
                    });
                    ig.game.spawnEntity(Particle_Red, x, y, {
                        flip: this.flip,
                        velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                        vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                    });
                    ig.game.spawnEntity(Particle_Red, x, y, {
                        flip: this.flip,
                        velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                        vely: Math.floor(Math.random() * this.maxVel.y / 2)
                    });
                }
            }
        },
        kill: function () {
            var x = this.pos.x + this.size.x / 2;
            var y = this.pos.y + this.size.y / 2;
            var count = ig.ua.mobile ? 1 : 4;
            for (i = 0; i <= count; i++) {
                ig.game.spawnEntity(Particle_Orange, x, y, {
                    flip: this.flip,
                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_Orange, x, y, {
                    flip: this.flip,
                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_Red, x, y, {
                    flip: this.flip,
                    velx: (true ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: -Math.floor(Math.random() * this.maxVel.y / 2)
                });
                ig.game.spawnEntity(Particle_Red, x, y, {
                    flip: this.flip,
                    velx: (false ? -Math.floor(Math.random() * this.maxVel.x / 4) : Math.floor(Math.random() * this.maxVel.x / 4)),
                    vely: Math.floor(Math.random() * this.maxVel.y / 2)
                });
            }
            ig.game.shakestrength = 4;
            ig.game.shakescreen.set(.5);
            ig.game.spawnEntity(ExplosionEffect, this.pos.x + this.size.x / 2 - 30, this.pos.y + (this.size.y / 2) - 30, {
                owner: 'bot'
            });
            ig.game.spawnEntity(EntityTimeBonus, this.pos.x + this.size.x / 2 - 16, this.pos.y + (this.size.y / 2) - 16);
            ig.game.removeEntity(this);
        }
    });
});

// lib/game/entities/portalfinish.js
ig.baked = true;
ig.module('game.entities.portalfinish').requires('impact.entity').defines(function () {
    EntityPortalfinish = ig.Entity.extend({
        size: {
            x: 64,
            y: 64
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 500,
            y: 500
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(0, 255, 0, 0.5)',
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        target: null,
        targets: [],
        currentTarget: 0,
        speed: 0,
        gravityFactor: 0,
        name: '',
        teleport: false,
        teleporttimer: null,
        initialize: false,
        animSheet: new ig.AnimationSheet('media/entity-portal-finish.png', 64, 64),
        init: function (x, y, settings) {
            this.addAnim('idle', .1, [0, 1, 2, 3]);
            this.curentAnim = this.anims.idle;
            this.parent(x, y, settings);
            if (this.target) {
                this.targets = ig.ksort(this.target);
            }
        },
        update: function () {
            this.currentAnim = this.anims.idle;
            this.parent();
        },
        check: function (other) {
            if (other == ig.game.player) {
                if ((Math.abs((other.pos.x + other.size.x / 2) - (this.pos.x + this.size.x / 2)) < this.size.x / 2) && (Math.abs((other.pos.y + other.size.y / 2) - (this.pos.y + this.size.y / 2)) < this.size.y / 2)) {
                    if (!this.teleport) {
                        ig.game.spawnEntity(EntityLevelFinishEffect, this.pos.x + this.size.x / 2 - 60, this.pos.y + this.size.y / 2 - 60);
                        this.teleporttimer = new ig.Timer(.75);
                        this.teleport = true;
                        ig.game.player.teleporttimer.set(.75);
                    }
                    if (this.teleporttimer.delta() >= 0) {
                        ig.game.levelcomplete = true;
                        ig.game.levelcompletetimer.reset();
                        ig.game.levelcompleteflag = true;
                        ig.game.removeEntity(ig.game.player);
                        var timer = ig.game.getEntityByName('leveltime');
                        ig.game.removeEntity(timer);
                    }
                }
            }
        },
        receiveDamage: function (amount, from, x, y) {
            this.health = this.health;
        }
    });
});

// lib/game/entities/gravityswitch.js
ig.baked = true;
ig.module('game.entities.gravityswitch').requires('impact.entity').defines(function () {
    EntityGravityswitch = ig.Entity.extend({
        size: {
            x: 64,
            y: 64
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 500,
            y: 500
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(0, 0, 255, 0.5)',
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        speed: 0,
        gravityFactor: 0,
        name: '',
        switchtimer: null,
        animSheet: new ig.AnimationSheet('media/entity-gravityswitch.png', 64, 64),
        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('down', .1, [4, 5, 6, 7, 6, 5]);
            this.addAnim('up', .1, [0, 1, 2, 3, 2, 1]);
            this.switchtimer = new ig.Timer(1);
            if (ig.game.gravity < 0) {
                ig.game.gravity = -ig.game.gravity;
            }
            this.currentAnim = this.anims.up;
        },
        check: function (other) {
            if (other.name == 'bullet') {
                if (this.switchtimer.delta() > 0) {
                    ig.game.gravity = -ig.game.gravity;
                    if (ig.game.gravity > 0) {
                        var switches = ig.game.getEntitiesByType(EntityGravityswitch);
                        for (i = 0; i < switches.length; i++) {
                            switches[i].currentAnim = switches[i].anims.up;
                        }
                        ig.game.spawnEntity(EntityPortalEnterEffect, this.pos.x + this.size.x / 2 - 60, this.pos.y + this.size.y / 2 - 60);
                    }
                    if (ig.game.gravity < 0) {
                        var switches = ig.game.getEntitiesByType(EntityGravityswitch);
                        for (i = 0; i < switches.length; i++) {
                            switches[i].currentAnim = switches[i].anims.down;
                        }
                        ig.game.spawnEntity(EntityPortalExitEffect, this.pos.x + this.size.x / 2 - 60, this.pos.y + this.size.y / 2 - 60);
                    }
                    this.switchtimer.set(1);
                }
                other.kill();
            }
        },
        receiveDamage: function (amount, from, x, y) {
            this.health = this.health;
        }
    });
});

// lib/game/entities/doorswitch.js
ig.baked = true;
ig.module('game.entities.doorswitch').requires('impact.entity').defines(function () {
    EntityDoorswitch = ig.Entity.extend({
        size: {
            x: 64,
            y: 64
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 500,
            y: 500
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(0, 0, 255, 0.5)',
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        target: null,
        targets: [],
        currentTarget: 0,
        speed: 0,
        gravityFactor: 0,
        name: '',
        teleport: false,
        initialize: false,
        switched: null,
        animSheet: new ig.AnimationSheet('media/entity-doorswitch.png', 64, 64),
        init: function (x, y, settings) {
            this.addAnim('locked', .1, [4, 5, 6, 7, 6, 5]);
            this.addAnim('unlocked', .1, [0, 1, 2, 3, 2, 1]);
            this.curentAnim = this.anims.idle;
            this.parent(x, y, settings);
            this.switched = false;
            if (this.target) {
                this.targets = ig.ksort(this.target);
            }
            this.currentAnim = this.anims.locked;
        },
        update: function () {
            this.parent();
        },
        check: function (other) {
            if (other.name == 'bullet') {
                other.kill();
                if ((Math.abs((other.pos.x + other.size.x / 2) - (this.pos.x + this.size.x / 2)) < this.size.x / 2) && (Math.abs((other.pos.y + other.size.y / 2) - (this.pos.y + this.size.y / 2)) < this.size.y / 2)) {
                    if (this.target) {
                        if (!this.switched) {
                            var oldDistance = 0;
                            var target = ig.game.getEntityByName(this.targets[this.currentTarget]);
                            if (target) {
                                target.kill();
                                ig.game.spawnEntity(EntityLevelFinishEffect, this.pos.x + this.size.x / 2 - 60, this.pos.y + this.size.y / 2 - 60);
                            }
                            this.currentAnim = this.anims.unlocked;
                            this.switched = true;
                        }
                    }
                }
            }
        },
        receiveDamage: function (amount, from, x, y) {
            this.health = this.health;
        }
    });
});

// lib/game/entities/healthitem.js
ig.baked = true;
ig.module('game.entities.healthitem').requires('impact.entity').defines(function () {
    EntityHealthitem = ig.Entity.extend({
        size: {
            x: 64,
            y: 64
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 500,
            y: 500
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(0, 0, 255, 0.5)',
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.PASSIVE,
        speed: 0,
        gravityFactor: 0,
        name: '',
        teleport: false,
        initialize: false,
        fadeout: null,
        animSheet: new ig.AnimationSheet('media/entity-healthitem.png', 64, 64),
        init: function (x, y, settings) {
            this.addAnim('idle', .1, [0, 1, 2, 3, 2, 1]);
            this.curentAnim = this.anims.idle;
            this.parent(x, y, settings);
            this.switched = false;
            this.fadeout = new ig.Timer(0);
        },
        update: function () {
            if (this.fadeout.delta() < 0) {
                this.currentAnim.alpha = -this.fadeout.delta();
            }
            if (this.switched && this.fadeout.delta() > 0) {
                this.kill();
            }
            this.parent();
        },
        check: function (other) {
            if (other.name == 'bullet') {
                other.kill();
                if ((Math.abs((other.pos.x + other.size.x / 2) - (this.pos.x + this.size.x / 2)) < this.size.x / 2) && (Math.abs((other.pos.y + other.size.y / 2) - (this.pos.y + this.size.y / 2)) < this.size.y / 2)) {
                    if (ig.game.player) {
                        if (!this.switched) {
                            this.switched = true;
                            ig.game.player.health = ig.game.player.inithealth;
                            ig.game.spawnEntity(EntityLevelFinishEffect, this.pos.x + this.size.x / 2 - 60, this.pos.y + this.size.y / 2 - 60);
                            this.fadeout.set(.5);
                        }
                    }
                }
            }
        },
        receiveDamage: function (amount, from, x, y) {
            this.health = this.health;
        }
    });
});

// lib/game/entities/lockarea.js
ig.baked = true;
ig.module('game.entities.lockarea').requires('impact.entity').defines(function () {
    EntityLockarea = ig.Entity.extend({
        _wmScalable: true,
        _wmDrawBox: true,
        size: {
            x: 64,
            y: 64
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 0,
            y: 0
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(255, 0, 0, 1)',
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.FIXED,
        gravityFactor: 0,
        name: '',
        zIndex: 10,
        draw: function () {
            var x1 = this.pos.x - this.offset.x - ig.game.screen.x;
            var y1 = this.pos.y - this.offset.y - ig.game.screen.y;
            var x2 = this.pos.x - this.offset.x - ig.game.screen.x + this.size.x;
            var y2 = this.pos.y - this.offset.y - ig.game.screen.y + this.size.y;
            ig.system.context.shadowBlur = 0;
            ig.system.context.globalAlpha = 1;
            var gradient = ig.system.context.createLinearGradient(x1 + 1, y1 + 1, x1 + 1, y1 + 16);
            gradient.addColorStop(0, "#fff");
            gradient.addColorStop(1, "#ff0000");
            ig.system.context.fillStyle = '#ff0000';
            ig.system.context.fillRect(x1, y1, x2 - x1, y2 - y1);
            ig.system.context.fillStyle = gradient;
            ig.system.context.globalAlpha = .5;
            ig.system.context.fillRect(x1 + 1, y1 + 1, x2 - x1 - 2, y2 - y1 - 2);
            ig.system.context.globalAlpha = 1;
            ig.system.context.strokeStyle = '#fff';
            ig.system.context.lineWidth = 1;
            ig.system.context.strokeRect(x1, y1, x2 - x1, y2 - y1);
        },
        kill: function () {
            ig.game.removeEntity(this);
        }
    });
});

// lib/game/entities/travelregion.js
ig.baked = true;
ig.module('game.entities.travelregion').requires('impact.entity').defines(function () {
    EntityTravelregion = ig.Entity.extend({
        _wmScalable: true,
        _wmDrawBox: true,
        size: {
            x: 64,
            y: 64
        },
        offset: {
            x: 0,
            y: 0
        },
        maxVel: {
            x: 0,
            y: 0
        },
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(50, 50, 0, 0.5)',
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        gravityFactor: 0,
        name: '',
        text: '',
        zIndex: 10,
    });
});

// lib/game/main.js
ig.baked = true;
ig.module('game.main').requires('impact.game', 'impact.font', 'game.entities.player', 'game.entities.weapons', 'game.entities.particles', 'game.entities.effects', 'game.entities.spring', 'game.entities.springleft', 'game.entities.springright', 'game.entities.springupleft', 'game.entities.springupright', 'game.entities.springdownleft', 'game.entities.springdownright', 'game.entities.springdown', 'game.entities.speedarrow', 'game.entities.leveltime', 'game.entities.enemydrone1', 'game.entities.enemyfixed1', 'game.entities.enemyfixed2', 'game.entities.enemyfixed3', 'game.entities.enemyfixed4', 'game.entities.enemyboss1', 'game.entities.hazardsawblade', 'game.entities.displaytext', 'game.entities.portalenter', 'game.entities.portalexit', 'game.entities.portalenemy', 'game.entities.portalfinish', 'game.entities.gravityswitch', 'game.entities.doorswitch', 'game.entities.healthitem', 'game.entities.lockarea', 'game.entities.travelregion', 'game.levels.1', 'game.levels.2', 'game.levels.3', 'game.levels.4', 'game.levels.5', 'game.levels.6', 'game.levels.7', 'game.levels.8', 'game.levels.9', 'game.levels.10').defines(function () {
    MyGame = ig.Game.extend({
        numberoflevels: 10,
        time: 0,
        levelcomplete: false,
        gravity: 1000,
        healthmeter: new ig.Image('media/healthmeter.png'),
        healthmeterstart: new ig.Image('media/healthmeterstart.png'),
        healthmeterend: new ig.Image('media/healthmeterend.png'),
        playericon: new ig.Image('media/player-icon.png'),
        playerdeadicon: new ig.Image('media/player-icondead.png'),
        highscorestaron: new ig.Image('media/star-on.png'),
        highscorestaroff: new ig.Image('media/star-off.png'),
        entitylimit: ig.ua.mobile ? 5 : 150,
        qualitychangetimer: new ig.Timer(0),
        qualitymessage: "",
        fxquality: 'high',
        homescreen: true,
        homescreentimer: null,
        homekeypress: true,
        leveltoload: 1,
        savedlevel: 0,
        levelscore: 0,
        pause: false,
        pauseflag: false,
        titleimg: new ig.Image('media/logo.jpg'),
        levelcomplete: false,
        levelcompletetimer: new ig.Timer(),
        levelcompleteflag: false,
        showcredits: false,
        creditsshown: false,
        creditsshowntimer: new ig.Timer(0),
        inittime: 0,
        player: null,
        activedistance: null,
        sound: false,
        soundon: new ig.Image('media/soundon.png'),
        soundoff: new ig.Image('media/soundoff.png'),
        soundtoggle: new ig.Timer(3),
        shakescreen: new ig.Timer(0),
        shakestrength: 5,
        resetscores: false,
        showfps: false,
        framerateNow: 0,
        fps: 0,
        playername: "Player",
        playerid: null,
        gethighscores: false,
        highscorerank: null,
        highscorename: null,
        highscorepoints: null,
        playerrunning: false,
        displaytext: false,
        text: '',
        init: function () {
            Playtomic.Log.View(2727, "8e22a33605bb4d78", document.location);
            ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
            ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
            ig.input.bind(ig.KEY.UP_ARROW, 'jump');
            ig.input.bind(ig.KEY.DOWN_ARROW, 'duck');
            ig.input.bind(ig.KEY.X, 'shoot1');
            ig.input.bind(ig.KEY.SHIFT, 'shoot1');
            ig.input.bind(ig.KEY.SPACE, 'pause');
            ig.input.bind(ig.KEY.ALT, 'sound');
            ig.input.bind(ig.KEY.ENTER, 'home');
            ig.input.bind(ig.KEY.F, 'fps');
            ig.input.bind(ig.KEY.Q, 'quality');
            ig.input.bind(ig.KEY.N, 'name');
            ig.input.bind(ig.KEY.W, 'jump');
            ig.input.bind(ig.KEY.A, 'left');
            ig.input.bind(ig.KEY.S, 'duck');
            ig.input.bind(ig.KEY.D, 'right');
            ig.input.bind(ig.KEY.CAPS, 'restart');
            ig.input.bind(ig.KEY.MOUSE1, 'shoot1');
            if (ig.ua.iPhone4) {
                ig.ua.mobile = true;
            }
            if (ig.ua.mobile) {
                ig.input.bindTouch('#buttonLeft', 'left');
                ig.input.bindTouch('#buttonRight', 'right');
                ig.input.bindTouch('#buttonJump', 'jump');
                ig.input.bindTouch('#buttonJump2', 'jump');
                ig.input.bindTouch('#buttonDuck', 'duck');
                ig.input.bindTouch('#buttonShoot', 'shoot1');
                ig.input.bindTouch('#buttonHome', 'home');
                ig.input.bindTouch('#buttonPause', 'pause');
            }
            this.homescreen = true;
            this.homescreentimer = new ig.Timer();
            if (this.resetscores) {
                localStorage.setItem('Level', 1);
                localStorage.setItem('HighScore1', 0);
                localStorage.setItem('HighScore2', 0);
                localStorage.setItem('HighScore3', 0);
                localStorage.setItem('HighScore4', 0);
                localStorage.setItem('HighScore5', 0);
                localStorage.setItem('HighScore6', 0);
                localStorage.setItem('HighScore7', 0);
                localStorage.setItem('HighScore8', 0);
                localStorage.setItem('HighScore9', 0);
                localStorage.setItem('HighScore10', 0);
            }
            document: ReverseDisplay('enterusername');
            this.savedlevel = this.numberoflevels;
            this.leveltoload = 1;
            this.activedistance = ig.system.width * .75;
            ig.Sound.enabled = false;
            if (ig.Sound.enabled == true) {}
            if (ig.ua.mobile) {
                ig.Timer.timeScale = 1.2;
            }
            this.shakescreen.set(0);
            this.highscorerank = new Array();
            this.highscorename = new Array();
            this.highscorepoints = new Array();
            this.gethighscores = true;
            for (i = 0; i < 5; i++) {
                this.highscorerank[i] = i;
                this.highscorename[i] = "";
                this.highscorepoints[i] = "";
            }
        },
        update: function () {
            if (ig.input.pressed('restart') && !this.homescreen && !this.levelcomplete) {
                this.removeEntity(this.player);
                var timer = this.getEntityByName('leveltime');
                this.removeEntity(timer);
                this.loadLevel(ig.global['Level' + this.leveltoload]);
            }
            this.playername = document.getElementById("playername").value;
            if (this.playername == "") {
                this.playername = "Player";
            }
            var now = (new Date()).getTime();
            var delta = now - this.framerateNow;
            this.framerateNow = (new Date()).getTime();
            this.fps = Math.floor(1000 / (delta));
            this.player = ig.game.getEntityByName('player');
            var timer = ig.game.getEntityByName('leveltime');
            if (timer) {
                this.time = timer.time;
                this.levelscore = this.time;
            }
            if (this.fps < 5 && !this.levelcomplete && !this.pause && !this.homescreen && (this.entitylimit > 5) && this.time > 3) {
                if (this.entitylimit == 150) {
                    this.entitylimit = 75;
                    this.qualitymessage = "FPS Drop Detected - Changing FX Quality to: MEDIUM"
                    this.fxquality = 'medium';
                } else if (this.entitylimit == 75) {
                    this.entitylimit = 5;
                    this.qualitymessage = "FPS Drop Detected - Changing FX Quality to: LOW"
                    this.fxquality = 'low';
                }
                this.qualitychangetimer.set(2);
            }
            if (ig.input.pressed('name')) {
                document: ReverseDisplay('enterusername');
                if (!this.pause && !this.homescreen && !this.levelcomplete) {
                    this.pause = true;
                    this.pauseflag = true;
                }
            }
            if (ig.input.pressed('fps')) {
                this.showfps = !this.showfps;
            }
            if (ig.input.pressed('quality')) {
                if (this.entitylimit == 150) {
                    this.entitylimit = 75;
                    this.qualitymessage = "FX Quality: MEDIUM"
                    this.fxquality = 'medium';
                } else if (this.entitylimit == 75) {
                    this.entitylimit = 5;
                    this.qualitymessage = "FX Quality: LOW"
                    this.fxquality = 'low';
                } else if (this.entitylimit == 5) {
                    this.entitylimit = 150;
                    this.qualitymessage = "FX Quality: HIGH"
                    this.fxquality = 'high';
                }
                this.qualitychangetimer.set(2);
            }
            if (ig.input.pressed('pause') && !this.homescreen && !this.levelcomplete) {
                if (this.pause == false) {
                    this.pause = true;
                    this.pauseflag = true;
                    if (ig.Sound.enabled == true) {}
                } else {
                    this.pause = false;
                    this.pauseflag = false;
                    if (ig.Sound.enabled == true) {}
                }
            }
            if (this.pause) {}
            if ((this.creditsshown && this.creditsshowntimer.delta() > 0) && ((ig.input.pressed('shoot1') || ig.input.pressed('shoot2')))) {
                this.creditsshown = false;
                if (this.player) {
                    ig.game.removeEntity(this.player);
                }
                ig.system.context.fillStyle = '#000000';
                ig.system.context.fillRect(0, 0, ig.system.width * ig.system.scale, ig.system.height * ig.system.scale);
                this.levelcomplete = false;
                this.levelcompleteflag = false;
                this.displaytext = false;
                this.homescreen = true;
                this.homescreentimer = new ig.Timer();
                this.gethighscores = true;
                for (i = 0; i < 5; i++) {
                    this.highscorerank[i] = i;
                    this.highscorename[i] = "";
                    this.highscorepoints[i] = "";
                }
                if (ig.Sound.enabled == true) {}
                this.leveltoload = this.leveltoload;
            }
            if ((this.levelcomplete && this.levelcompletetimer.delta() > 1) && ((ig.input.pressed('shoot1') || ig.input.pressed('shoot2')))) {
                this.displaytext = false;
                if (this.player) {
                    ig.game.removeEntity(this.player);
                }
                ig.system.context.fillStyle = '#000000';
                ig.system.context.fillRect(0, 0, ig.system.width * ig.system.scale, ig.system.height * ig.system.scale);
                if (this.leveltoload == this.numberoflevels) {
                    this.creditsshown = true;
                    this.creditsshowntimer.set(1);
                } else {
                    this.levelcomplete = false;
                    this.levelcompleteflag = false;
                    this.homescreen = true;
                    this.homescreentimer = new ig.Timer();
                    this.gethighscores = true;
                    for (i = 0; i < 5; i++) {
                        this.highscorerank[i] = i;
                        this.highscorename[i] = "";
                        this.highscorepoints[i] = "";
                    }
                    if (ig.Sound.enabled == true) {}
                    if (this.leveltoload < this.numberoflevels) {
                        this.leveltoload = parseInt(this.leveltoload) + 1;
                    }
                }
            }
            if ((ig.input.pressed('home') && !this.homescreen && !this.pause && !this.storyshown)) {
                if (this.player) {
                    ig.game.removeEntity(this.player);
                }
                ig.system.context.fillStyle = '#000000';
                ig.system.context.fillRect(0, 0, ig.system.width * ig.system.scale, ig.system.height * ig.system.scale);
                this.levelcomplete = false;
                this.levelcompleteflag = false;
                this.homescreen = true;
                this.displaytext = false;
                this.homescreentimer = new ig.Timer();
                this.gethighscores = true;
                for (i = 0; i < 5; i++) {
                    this.highscorerank[i] = i;
                    this.highscorename[i] = "";
                    this.highscorepoints[i] = "";
                }
                if (ig.Sound.enabled == true) {}
            }
            if ((this.homescreen && this.homescreentimer.delta() > .3)) {
                if (this.gravity < 0) {
                    this.gravity = -this.gravity;
                }
                if ((ig.input.pressed('jump') || ig.input.pressed('right')) && this.leveltoload < this.savedlevel) {
                    this.leveltoload = this.leveltoload + 1;
                    this.homekeypress = true;
                    if (ig.Sound.enabled) {
                        ig.game.key.play();
                    }
                    this.gethighscores = true;
                    for (i = 0; i < 5; i++) {
                        this.highscorerank[i] = i;
                        this.highscorename[i] = "";
                        this.highscorepoints[i] = "";
                    }
                }
                if ((ig.input.pressed('duck') || ig.input.pressed('left')) && this.leveltoload > 1) {
                    this.leveltoload = this.leveltoload - 1;
                    this.homekeypress = true;
                    if (ig.Sound.enabled) {
                        ig.game.key.play();
                    }
                    this.gethighscores = true;
                    for (i = 0; i < 5; i++) {
                        this.highscorerank[i] = i;
                        this.highscorename[i] = "";
                        this.highscorepoints[i] = "";
                    }
                }
                if ((ig.input.pressed('shoot1') || ig.input.pressed('shoot2'))) {
                    this.displaytext = false;
                    this.homescreen = false;
                    this.homekeypress = false;
                    this.levelscore = 0;
                    if (ig.Sound.enabled) {
                        ig.game.explosion1.play();
                    }
                    this.loadLevel(ig.global['Level' + this.leveltoload]);
                    Playtomic.Log.Play();
                    var levelplayed = String('Level' + this.leveltoload);
                    Playtomic.Log.CustomMetric(levelplayed + " Started");
                    if (ig.Sound.enabled == true) {}
                    this.parent();
                }
            } else {
                if (this.pause) {} else {
                    if (this.player) {
                        if (this.shakescreen.delta() < 0) {
                            var strength = this.shakestrength;
                            var s = strength;
                            if (s > 0.2) {
                                this.screen.x = this.player.pos.x - ig.system.width / 2 + Math.random().map(-1, 1, -s, s) * -this.shakescreen.delta();
                                this.screen.y = this.player.pos.y + this.player.size.y - ig.system.height / 2 + Math.random().map(-1, 1, -s, s) * -this.shakescreen.delta();
                            }
                        } else {
                            this.screen.x = this.player.pos.x - ig.system.width / 2;
                            this.screen.y = this.player.pos.y + this.player.size.y - ig.system.height / 2;
                        }
                    } else {
                        this.playerspawner = ig.game.getEntityByName('portal0');
                        if (this.playerspawner && this.time < 2) {
                            this.screen.x = this.playerspawner.pos.x + this.playerspawner.size.x / 2 - ig.system.width / 2 - 16;
                            this.screen.y = this.playerspawner.pos.y + this.playerspawner.size.y / 2 - ig.system.height / 2 + 24;
                        } else {}
                    }
                    this.parent();
                }
            }
        },
        draw: function () {
            if (this.pause) {
                if (this.pauseflag) {
                    ig.system.context.shadowColor = "000";
                    var fontsize = 26;
                    ig.system.context.textAlign = 'center';
                    ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                    ig.system.context.fillStyle = '#000000';
                    ig.system.context.fillText('PAUSED', ig.system.width / 2 + 1, ig.system.height / 3 - 12);
                    ig.system.context.fillStyle = '#fff';
                    ig.system.context.fillText('PAUSED', ig.system.width / 2, ig.system.height / 3 - 13);
                    this.pauseflag = false;
                }
            } else {
                if (this.homescreen) {
                    this.storyshown = false;
                    ig.system.context.globalAlpha = 1;
                    ig.system.context.fillStyle = '#000000';
                    ig.system.context.fillRect(0, 0, ig.system.width * ig.system.scale, ig.system.height * ig.system.scale);
                    this.titleimg.draw(0, 0);
                    if (this.homekeypress == true) {
                        this.homekeypress = false;
                    }
                    var twostarshighscore = 0;
                    var threestarshighscore = 0;
                    var botcount = 0;
                    var leveltime = 0;
                    switch (this.leveltoload.toString()) {
                    case "1":
                        twostarhighscore = 30;
                        threestarhighscore = 20;
                        break;
                    case "2":
                        twostarhighscore = 45;
                        threestarhighscore = 30;
                        break;
                    case "3":
                        twostarhighscore = 45;
                        threestarhighscore = 30;
                        break;
                    case "4":
                        twostarhighscore = 45;
                        threestarhighscore = 30;
                        break;
                    case "5":
                        twostarhighscore = 45;
                        threestarhighscore = 30;
                        break;
                    case "6":
                        twostarhighscore = 45;
                        threestarhighscore = 30;
                        break;
                    case "7":
                        twostarhighscore = 45;
                        threestarhighscore = 30;
                        break;
                    case "8":
                        twostarhighscore = 45;
                        threestarhighscore = 30;
                        break;
                    case "9":
                        twostarhighscore = 45;
                        threestarhighscore = 30;
                        break;
                    case "10":
                        twostarhighscore = 45;
                        threestarhighscore = 30;
                        break;
                    case "11":
                        twostarhighscore = 45;
                        threestarhighscore = 30;
                        break;
                    case "12":
                        twostarhighscore = 45;
                        threestarhighscore = 30;
                        break;
                    case "13":
                        twostarhighscore = 45;
                        threestarhighscore = 30;
                        break;
                    case "14":
                        twostarhighscore = 45;
                        threestarhighscore = 30;
                        break;
                    case "15":
                        twostarhighscore = 45;
                        threestarhighscore = 30;
                        break;
                    }
                    var highscore = localStorage.getItem('HighScore' + this.leveltoload.toString());
                    if (highscore == null) {
                        highscore = 0;
                    }
                    var fontsize = 26;
                    ig.system.context.textAlign = 'center';
                    ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                    ig.system.context.shadowColor = "000";
                    ig.system.context.fillStyle = '#000000';
                    ig.system.context.fillText('ZONE' + this.leveltoload, ig.system.width / 2 + 1, ig.system.height * .5 - 13);
                    ig.system.context.fillStyle = '#fff';
                    ig.system.context.fillText('ZONE ' + this.leveltoload, ig.system.width / 2, ig.system.height * .5 - 14);
                    ig.system.context.fillStyle = '#000000';
                    ig.system.context.fillText('YOUR FASTEST TIME: ' + highscore + " sec", ig.system.width / 2 + 1, ig.system.height * .5 + 54);
                    ig.system.context.fillStyle = '#fff';
                    ig.system.context.fillText('YOUR FASTEST TIME: ' + highscore + " sec", ig.system.width / 2, ig.system.height * .5 + 53);
                    var fontsize = 13;
                    ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                    var helptext = '(ARROWS TO CHANGE LEVELS - SHOOT TO START)';
                    ig.system.context.fillStyle = '#000000';
                    ig.system.context.fillText(helptext, ig.system.width / 2 + 1, ig.system.height * .95);
                    ig.system.context.fillStyle = '#fff';
                    ig.system.context.fillText(helptext, ig.system.width / 2, ig.system.height * .95);
                    if (highscore > 0) {
                        this.highscorestaron.draw(ig.system.width / 2 - 95, ig.system.height * .5 + 68);
                    } else {
                        this.highscorestaroff.draw(ig.system.width / 2 - 95, ig.system.height * .5 + 68);
                    }
                    if (highscore > 0 && highscore <= twostarhighscore) {
                        this.highscorestaron.draw(ig.system.width / 2 - 30, ig.system.height * .5 + 68);
                    } else {
                        this.highscorestaroff.draw(ig.system.width / 2 - 30, ig.system.height * .5 + 68);
                    }
                    if (highscore > 0 && highscore <= threestarhighscore) {
                        this.highscorestaron.draw(ig.system.width / 2 + 35, ig.system.height * .5 + 68);
                    } else {
                        this.highscorestaroff.draw(ig.system.width / 2 + 35, ig.system.height * .5 + 68);
                    }
                    fontsize = 18;
                    ig.system.context.textAlign = 'center';
                    ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                    ig.system.context.fillStyle = '#000000';
                    ig.system.context.fillText('Leaderboard for ZONE ' + this.leveltoload, ig.system.width / 2 + 1, 517 + 1);
                    ig.system.context.fillStyle = '#fff';
                    ig.system.context.fillText('Leaderboard for ZONE ' + this.leveltoload, ig.system.width / 2, 517);
                    var column1 = 240;
                    var column2 = 280;
                    var column3 = 420;
                    var y = 540;
                    ig.system.context.globalAlpha = .6;
                    ig.system.context.fillStyle = '#000000';
                    ig.system.context.fillRect(230, 520, 245, 100);
                    ig.system.context.globalAlpha = 1;
                    ig.system.context.strokeStyle = '#fff';
                    ig.system.context.lineWidth = 2;
                    ig.system.context.strokeRect(230, 520, 245, 100);
                    fontsize = 11;
                    ig.system.context.textAlign = 'left';
                    ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                    ig.system.context.fillStyle = '#000000';
                    ig.system.context.fillText("RANK", column1 + 1, y + 1);
                    ig.system.context.fillStyle = '#0082ff';
                    ig.system.context.fillText("RANK", column1, y);
                    ig.system.context.textAlign = 'left';
                    ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                    ig.system.context.fillStyle = '#000000';
                    ig.system.context.fillText("PLAYER NAME", column2 + 1, y + 1);
                    ig.system.context.fillStyle = '#0082ff';
                    ig.system.context.fillText("PLAYER NAME", column2, y);
                    ig.system.context.textAlign = 'left';
                    ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                    ig.system.context.fillStyle = '#000000';
                    ig.system.context.fillText("TIME", column3 + 1, y + 1);
                    ig.system.context.fillStyle = '#0082ff';
                    ig.system.context.fillText("TIME", column3, y);
                    ig.system.context.shadowColor = "000";
                    var tablename = String('Level' + ig.game.leveltoload);

                    function HomeListComplete(scores, numscores, response) {
                        if (response.Success) {
                            scores.reverse();
                            for (i = 0; i < 5; i++) {
                                var Score = scores[i];
                                if (Score) {
                                    ig.game.highscorerank[i] = i;
                                    ig.game.highscorename[i] = Score.Name;
                                    ig.game.highscorepoints[i] = Score.Points / 10;
                                }
                            }
                        } else {}
                    }
                    var textcolor = "#fff";
                    fontsize = 11;
                    for (i = 0; i < 5; i++) {
                        var y = 555 + (fontsize + 2) * i;
                        if (this.highscorerank[i] >= 0) {
                            ig.system.context.textAlign = 'left';
                            ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                            ig.system.context.fillStyle = '#000000';
                            ig.system.context.fillText((this.highscorerank[i] + 1) + ")", column1 + 1, y + 1);
                            ig.system.context.fillStyle = textcolor;
                            ig.system.context.fillText((this.highscorerank[i] + 1) + ")", column1, y);
                        }
                        if (this.highscorename[i]) {
                            ig.system.context.textAlign = 'left';
                            ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                            ig.system.context.fillStyle = '#000000';
                            ig.system.context.fillText(this.highscorename[i], column2 + 1, y + 1);
                            ig.system.context.fillStyle = textcolor;
                            ig.system.context.fillText(this.highscorename[i], column2, y);
                        }
                        if (this.highscorepoints[i]) {
                            ig.system.context.textAlign = 'left';
                            ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                            ig.system.context.fillStyle = '#000000';
                            ig.system.context.fillText(this.highscorepoints[i] + " sec", column3 + 1, y + 1);
                            ig.system.context.fillStyle = textcolor;
                            ig.system.context.fillText(this.highscorepoints[i] + " sec", column3, y);
                        }
                    }
                    if (this.gethighscores == true) {
                        Playtomic.Leaderboards.List(tablename, HomeListComplete, {
                            highest: false,
                            perpage: 5000
                        });
                        this.gethighscores = false;
                    }
                    if (this.homescreentimer.delta() < 1) {
                        var alpha = 1 - this.homescreentimer.delta() * 2.5;
                        if (alpha < 0) {
                            alpha = 0;
                        }
                        ig.system.context.globalAlpha = alpha;
                        ig.system.context.fillStyle = '#fff';
                        ig.system.context.fillRect(0, 0, ig.system.width * ig.system.scale, ig.system.height * ig.system.scale);
                        ig.system.context.globalAlpha = 1;
                    }
                } else {
                    if (this.levelcomplete) {
                        if (this.player) {
                            ig.game.removeEntity(this.player);
                        }
                        if (this.creditsshown) {
                            Playtomic.Log.CustomMetric("ViewedCredits");
                            var s = ig.system.scale;
                            ig.system.context.fillStyle = '#000000';
                            ig.system.context.fillRect(0, 0, ig.system.width * ig.system.scale, ig.system.height * ig.system.scale);
                            ig.system.context.shadowColor = "000";
                            var fontsize = 26;
                            var story1 = "Thank You For Playing!";
                            var story2 = "Be Sure to Get 3 Stars on All Zones!";
                            var story3 = "Programming, Artwork, & Audio by Ascended Arts.";
                            ig.system.context.textAlign = 'center';
                            ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                            ig.system.context.fillStyle = '#e90000';
                            ig.system.context.fillText(story1, ig.system.width * s / 2 + 1, ig.system.height * .25 + 1);
                            ig.system.context.fillStyle = '#fff';
                            ig.system.context.fillText(story1, ig.system.width * s / 2, ig.system.height * .25);
                            ig.system.context.fillStyle = '#e90000';
                            ig.system.context.fillText(story2, ig.system.width * s / 2 + 1, ig.system.height * .5 + 1);
                            ig.system.context.fillStyle = '#fff';
                            ig.system.context.fillText(story2, ig.system.width * s / 2, ig.system.height * .5);
                            ig.system.context.fillStyle = '#e90000';
                            ig.system.context.fillText(story3, ig.system.width * s / 2 + 1, ig.system.height * .75 + 1);
                            ig.system.context.fillStyle = '#fff';
                            ig.system.context.fillText(story3, ig.system.width * s / 2, ig.system.height * .75);
                            var helptext = '(SHOOT TO CONTINUE)';
                            var fontsize = 13;
                            ig.system.context.textAlign = 'center';
                            ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                            ig.system.context.fillStyle = '#000000';
                            ig.system.context.fillText(helptext, ig.system.width / 2 + 1, ig.system.height * .95);
                            ig.system.context.fillStyle = '#fff';
                            ig.system.context.fillText(helptext, ig.system.width / 2, ig.system.height * .95);
                        } else if (this.levelcompleteflag) {
                            this.levelscore = this.time;
                            ig.system.context.globalAlpha = .4;
                            ig.system.context.fillStyle = '#000000';
                            ig.system.context.fillRect(0, 0, ig.system.width * ig.system.scale, ig.system.height * ig.system.scale);
                            ig.system.context.globalAlpha = 1;
                            ig.system.context.shadowColor = "000";
                            var fontsize = 22;
                            var playerscoretext = 'TIME:' + this.time + " SECONDS";
                            ig.system.context.textAlign = 'center';
                            ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                            ig.system.context.fillStyle = '#000000';
                            ig.system.context.fillText(playerscoretext, ig.system.width / 2 + 1, 6 + (fontsize * 3) + 1);
                            ig.system.context.fillStyle = '#fff';
                            ig.system.context.fillText(playerscoretext, ig.system.width / 2, 6 + (fontsize * 3));
                            ig.system.context.textAlign = 'center';
                            ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                            ig.system.context.fillStyle = '#000000';
                            ig.system.context.fillText('TOP 30 Leaderboard for ZONE ' + this.leveltoload, ig.system.width / 2 + 1, 10 + (fontsize * 5) + 1);
                            ig.system.context.fillStyle = '#fff';
                            ig.system.context.fillText('TOP 30 Leaderboard for ZONE ' + this.leveltoload, ig.system.width / 2, 10 + (fontsize * 5));
                            var column1 = 50;
                            var column2 = 150;
                            var column3 = 320;
                            var column4 = 400;
                            var y = 150;
                            ig.system.context.globalAlpha = .6;
                            ig.system.context.fillStyle = '#000000';
                            ig.system.context.fillRect(40, 130, 624, 500);
                            ig.system.context.globalAlpha = 1;
                            ig.system.context.strokeStyle = '#fff';
                            ig.system.context.lineWidth = 2;
                            ig.system.context.strokeRect(40, 130, 624, 500);
                            fontsize = 13;
                            ig.system.context.textAlign = 'left';
                            ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                            ig.system.context.fillStyle = '#000000';
                            ig.system.context.fillText("RANK", column1 + 1, y + 1);
                            ig.system.context.fillStyle = '#0082ff';
                            ig.system.context.fillText("RANK", column1, y);
                            ig.system.context.textAlign = 'left';
                            ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                            ig.system.context.fillStyle = '#000000';
                            ig.system.context.fillText("PLAYER NAME", column2 + 1, y + 1);
                            ig.system.context.fillStyle = '#0082ff';
                            ig.system.context.fillText("PLAYER NAME", column2, y);
                            ig.system.context.textAlign = 'left';
                            ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                            ig.system.context.fillStyle = '#000000';
                            ig.system.context.fillText("TIME", column3 + 1, y + 1);
                            ig.system.context.fillStyle = '#0082ff';
                            ig.system.context.fillText("TIME", column3, y);
                            ig.system.context.textAlign = 'left';
                            ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                            ig.system.context.fillStyle = '#000000';
                            ig.system.context.fillText("PLAYED", column4 + 1, y + 1);
                            ig.system.context.fillStyle = '#0082ff';
                            ig.system.context.fillText("PLAYED", column4, y);
                            var fontsize = 22;
                            var highscore = localStorage.getItem('HighScore' + this.leveltoload.toString());
                            if (highscore == null) {
                                highscore = 0;
                            }
                            if (this.levelscore < highscore || highscore == 0) {
                                ig.system.context.textAlign = 'center';
                                ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                                ig.system.context.fillStyle = '#000000';
                                ig.system.context.fillText('ZONE COMPLETED - PERSONAL FASTEST TIME!', ig.system.width / 2 + 1, 2 + (fontsize) + 1);
                                ig.system.context.fillStyle = '#00ff00';
                                ig.system.context.fillText('ZONE COMPLETED - PERSONAL FASTEST TIME!', ig.system.width / 2, 2 + (fontsize));
                                localStorage.setItem('HighScore' + this.leveltoload.toString(), this.levelscore);
                            } else {
                                ig.system.context.textAlign = 'center';
                                ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                                ig.system.context.fillStyle = '#000000';
                                ig.system.context.fillText('ZONE COMPLETED!', ig.system.width / 2 + 1, 2 + (fontsize) + 1);
                                ig.system.context.fillStyle = '#00ff00';
                                ig.system.context.fillText('ZONE COMPLETED!', ig.system.width / 2, 2 + (fontsize));
                            }
                            if (ig.Sound.enabled) {
                                ig.game.win.play();
                            }

                            function SubmitComplete(submitscore, submitted) {
                                fontsize = 13;
                                ig.system.context.textAlign = 'left';
                                ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                                ig.system.context.fillStyle = '#000000';
                                ig.system.context.fillText("FOUND!", 438 + 1, 619 + 1);
                                ig.system.context.fillStyle = '#fff';
                                ig.system.context.fillText("FOUND!", 438, 619);

                                function ListComplete(scores, numscores, response) {
                                    if (response.Success) {
                                        scores.reverse();
                                        fontsize = 13;
                                        for (i = 0; i < 30; i++) {
                                            var Score = scores[i];
                                            if (Score) {
                                                var playerscore = Score.Points / 10;
                                                var textcolor = "#fff";
                                                if ((Score.Name == ig.game.playername) && (playerscore == ig.game.levelscore) && (Score.RDate.search("seconds") >= 0)) {
                                                    textcolor = "#00ff00";
                                                }
                                                var y = 165 + (fontsize + 2) * i;
                                                ig.system.context.textAlign = 'left';
                                                ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                                                ig.system.context.fillStyle = '#000000';
                                                ig.system.context.fillText((i + 1) + ")", column1 + 1, y + 1);
                                                ig.system.context.fillStyle = textcolor;
                                                ig.system.context.fillText((i + 1) + ")", column1, y);
                                                ig.system.context.textAlign = 'left';
                                                ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                                                ig.system.context.fillStyle = '#000000';
                                                ig.system.context.fillText(Score.Name, column2 + 1, y + 1);
                                                ig.system.context.fillStyle = textcolor;
                                                ig.system.context.fillText(Score.Name, column2, y);
                                                ig.system.context.textAlign = 'left';
                                                ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                                                ig.system.context.fillStyle = '#000000';
                                                ig.system.context.fillText(playerscore + " sec", column3 + 1, y + 1);
                                                ig.system.context.fillStyle = textcolor;
                                                ig.system.context.fillText(playerscore + " sec", column3, y);
                                                ig.system.context.textAlign = 'left';
                                                ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                                                ig.system.context.fillStyle = '#000000';
                                                ig.system.context.fillText(Score.RDate, column4 + 1, y + 1);
                                                ig.system.context.fillStyle = textcolor;
                                                ig.system.context.fillText(Score.RDate, column4, y);
                                            }
                                        }
                                    } else {}
                                }
                                var tablename = String('Level' + ig.game.leveltoload);
                                Playtomic.Leaderboards.List(tablename, ListComplete, {
                                    perpage: 5000,
                                    highest: false
                                });
                            }
                            if (this.playername != "Player") {
                                var submitscore = {};
                                submitscore.Name = this.playername;
                                submitscore.Points = this.levelscore * 10;
                                var tablename = String('Level' + this.leveltoload);
                                Playtomic.Leaderboards.Submit(submitscore, tablename, SubmitComplete, {
                                    highest: false,
                                    allowduplicates: true
                                });
                            } else {
                                function ShowListComplete(scores, numscores, response) {
                                    fontsize = 13;
                                    ig.system.context.textAlign = 'left';
                                    ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                                    ig.system.context.fillStyle = '#000000';
                                    ig.system.context.fillText("FOUND!", 438 + 1, 619 + 1);
                                    ig.system.context.fillStyle = '#fff';
                                    ig.system.context.fillText("FOUND!", 438, 619);
                                    if (response.Success) {
                                        scores.reverse();
                                        fontsize = 13;
                                        for (i = 0; i < 30; i++) {
                                            var Score = scores[i];
                                            if (Score) {
                                                var playerscore = Score.Points / 10;
                                                var y = 165 + (fontsize + 2) * i;
                                                ig.system.context.textAlign = 'left';
                                                ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                                                ig.system.context.fillStyle = '#000000';
                                                ig.system.context.fillText((i + 1) + ")", column1 + 1, y + 1);
                                                ig.system.context.fillStyle = '#fff';
                                                ig.system.context.fillText((i + 1) + ")", column1, y);
                                                ig.system.context.textAlign = 'left';
                                                ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                                                ig.system.context.fillStyle = '#000000';
                                                ig.system.context.fillText(Score.Name, column2 + 1, y + 1);
                                                ig.system.context.fillStyle = '#fff';
                                                ig.system.context.fillText(Score.Name, column2, y);
                                                ig.system.context.textAlign = 'left';
                                                ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                                                ig.system.context.fillStyle = '#000000';
                                                ig.system.context.fillText(playerscore + " sec", column3 + 1, y + 1);
                                                ig.system.context.fillStyle = '#fff';
                                                ig.system.context.fillText(playerscore + " sec", column3, y);
                                                ig.system.context.textAlign = 'left';
                                                ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                                                ig.system.context.fillStyle = '#000000';
                                                ig.system.context.fillText(Score.RDate, column4 + 1, y + 1);
                                                ig.system.context.fillStyle = '#fff';
                                                ig.system.context.fillText(Score.RDate, column4, y);
                                            }
                                        }
                                    } else {}
                                }
                                var tablename = String('Level' + this.leveltoload);
                                Playtomic.Leaderboards.List(tablename, ShowListComplete, {
                                    perpage: 5000,
                                    highest: false
                                });
                            }
                            fontsize = 13;
                            ig.system.context.textAlign = 'center';
                            ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                            ig.system.context.fillStyle = '#000000';
                            ig.system.context.fillText("Retrieving Leaderboard...", ig.system.width / 2 + 1, 619 + 1);
                            ig.system.context.fillStyle = '#fff';
                            ig.system.context.fillText("Retrieving Leaderboard...", ig.system.width / 2, 619);
                            var helptext = '(SHOOT TO CONTINUE)';
                            fontsize = 13;
                            ig.system.context.textAlign = 'center';
                            ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                            ig.system.context.fillStyle = '#000000';
                            ig.system.context.fillText(helptext, ig.system.width / 2 + 1, ig.system.height * .95 + 1);
                            ig.system.context.fillStyle = '#fff';
                            ig.system.context.fillText(helptext, ig.system.width / 2, ig.system.height * .95);
                            ig.system.context.shadowColor = "000";
                            this.levelcompleteflag = false;
                        }
                    } else {
                        this.parent();
                    }
                    if (!this.creditsshown && !this.levelcomplete) {
                        if (this.time < 2) {
                            ig.system.context.shadowColor = "000";
                            var alpha = 1 - this.time;
                            if (alpha < 0) {
                                alpha = 0;
                            }
                            ig.system.context.globalAlpha = alpha;
                            ig.system.context.fillStyle = '#fff';
                            ig.system.context.fillRect(0, 0, ig.system.width * ig.system.scale, ig.system.height * ig.system.scale);
                            ig.system.context.globalAlpha = 1;
                        }
                        if (this.player) {
                            this.playericon.draw(2, 2);
                        } else {
                            this.playerdeadicon.draw(2, 2);
                        }
                        if (this.time / Math.floor(this.time) == 1) {
                            this.time = this.time + ".0";
                        }
                        if (this.player) {
                            if (this.player.health > 0) {
                                this.healthmeterstart.draw(2 + this.playerdeadicon.width, 2 + this.playerdeadicon.height / 2 - this.healthmeter.height / 2);
                                this.healthmeterend.draw(4 + this.playerdeadicon.width + this.player.health, 2 + this.playerdeadicon.height / 2 - this.healthmeter.height / 2);
                            }
                            for (i = 0; i <= this.player.health - 1; i++) {
                                this.healthmeter.draw(4 + this.playerdeadicon.width + ((this.healthmeter.width) * i), 2 + this.playerdeadicon.height / 2 - this.healthmeter.height / 2);
                            }
                        }
                        if (this.time >= 0) {
                            ig.system.context.shadowColor = "000";
                            var fontsize = 16;
                            ig.system.context.textAlign = 'left';
                            ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                            ig.system.context.fillStyle = '#000000';
                            ig.system.context.fillText('TIME: ' + this.time + "s", 3, 9 + this.playerdeadicon.height + 16);
                            ig.system.context.fillStyle = '#fff';
                            ig.system.context.fillText('TIME: ' + this.time + "s", 2, 8 + this.playerdeadicon.height + 16);
                            if (this.time < 1) {
                                var fontsize = 26;
                                ig.system.context.textAlign = 'center';
                                ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                                ig.system.context.fillStyle = '#000000';
                                ig.system.context.fillText('WARPING TO ZONE...', ig.system.width / 2 + 1, ig.system.height / 2 - 12);
                                ig.system.context.fillStyle = '#fff';
                                ig.system.context.fillText('WARPING TO ZONE...', ig.system.width / 2, ig.system.height / 2 - 13);
                            }
                            if ((this.time < 2) && (this.time > 1)) {
                                var fontsize = 26;
                                ig.system.context.textAlign = 'center';
                                ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                                ig.system.context.fillStyle = '#000000';
                                ig.system.context.fillText('START!', ig.system.width / 2 + 1, ig.system.height / 2 - 12);
                                ig.system.context.fillStyle = '#ff0000';
                                ig.system.context.fillText('START!', ig.system.width / 2, ig.system.height / 2 - 13);
                            }
                            if (this.displaytext) {
                                ig.system.context.shadowColor = "000";
                                var fontsize = 13;
                                ig.system.context.textAlign = 'center';
                                ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                                ig.system.context.fillStyle = '#000000';
                                ig.system.context.fillText(this.text, ig.system.width / 2 + 1, ig.system.height / 4 - 12);
                                ig.system.context.fillStyle = '#fff';
                                ig.system.context.fillText(this.text, ig.system.width / 2, ig.system.height / 4 - 13);
                            }
                        }
                    }
                }
            }
            if (this.soundtoggle.delta() < 0 && !this.pause) {
                if (!ig.ua.mobile) {
                    if (this.sound == false) {
                        ig.system.context.globalAlpha = -this.soundtoggle.delta();
                        this.soundoff.draw(2, (ig.system.height) - (this.soundon.height) - 2);
                        ig.system.context.globalAlpha = 1;
                    } else {
                        ig.system.context.globalAlpha = -this.soundtoggle.delta();
                        this.soundon.draw(2, (ig.system.height) - (this.soundon.height) - 2);
                        ig.system.context.globalAlpha = 1;
                    }
                }
            }
            if (this.showfps && !this.pause) {
                ig.system.context.shadowColor = "000";
                var fontsize = 12;
                ig.system.context.textAlign = 'right';
                ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                ig.system.context.fillStyle = '#000000';
                ig.system.context.fillText(this.fps + 'fps', ig.system.width - 1, ig.system.height - 1);
                ig.system.context.fillStyle = '#fff';
                ig.system.context.fillText(this.fps + 'fps', ig.system.width - 2, ig.system.height - 2);
            }
            if (this.qualitychangetimer.delta() < 0 && !this.pause) {
                ig.system.context.shadowColor = "000";
                var fontsize = 12;
                ig.system.context.textAlign = 'right';
                ig.system.context.font = 'bold ' + fontsize + 'px Ubuntu, arial, sans-serif';
                ig.system.context.fillStyle = '#000000';
                ig.system.context.fillText(this.qualitymessage, ig.system.width - 1, ig.system.height - 2 - fontsize);
                ig.system.context.fillStyle = '#fff';
                ig.system.context.fillText(this.qualitymessage, ig.system.width - 2, ig.system.height - 3 - fontsize);
            }
        }
    });
    if (ig.ua.mobile || ig.ua.iPhone4) {
        ig.Sound.enabled = false;
    }
    if (ig.ua.iPhone4) {
        ig.main('#canvas', MyGame, 30, 160, 140, 2);
    } else if (ig.ua.mobile) {
        ig.main('#canvas', MyGame, 30, 160, 140, 2);
    } else {
        ig.main('#canvas', MyGame, 30, 704, 704, 1);
    }
});