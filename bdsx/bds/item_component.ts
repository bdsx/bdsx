import { abstract } from "../common";
import { NativeClass } from "../nativeclass";
import { Actor } from "./actor";
import { Block, BlockLegacy, BlockSource } from "./block";
import { Vec3 } from "./blockpos";
import { HashedString } from "./hashedstring";
import type { ItemDescriptor, ItemStack, ItemStackBase } from "./inventory";
import { CompoundTag } from "./nbt";
import type { Player } from "./player";

export class ItemComponent extends NativeClass {
    static getIdentifier(): HashedString {
        abstract();
    }
    buildNetworkTag():CompoundTag {
        abstract();
    }
    initializeFromNetwork(tag:CompoundTag): void {
        abstract();
    }
    isCooldown(): this is CooldownItemComponent {
        abstract();
    }
    isDurability(): this is DurabilityItemComponent {
        abstract();
    }
    isDigger(): this is DiggerItemComponent {
        abstract();
    }
    isDisplayName(): this is DisplayNameItemComponent {
        abstract();
    }
    isDyePowder(): this is DyePowderItemComponent {
        abstract();
    }
    isEntityPlacer(): this is EntityPlacerItemComponent {
        abstract();
    }
    isFood(): this is FoodItemComponent {
        abstract();
    }
    isFuel(): this is FuelItemComponent {
        abstract();
    }
    isIcon(): this is IconItemComponent {
        abstract();
    }
    isKnockbackResistance(): this is KnockbackResistanceItemComponent {
        abstract();
    }
    isOnUse(): this is OnUseItemComponent {
        abstract();
    }
    isPlanter(): this is PlanterItemComponent {
        abstract();
    }
    isProjectile(): this is ProjectileItemComponent {
        abstract();
    }
    isRecord(): this is RecordItemComponent {
        abstract();
    }
    isRenderOffsets(): this is RenderOffsetsItemComponent {
        abstract();
    }
    isRepairable(): this is RepairableItemComponent {
        abstract();
    }
    isShooter(): this is ShooterItemComponent {
        abstract();
    }
    isThrowable(): this is ThrowableItemComponent {
        abstract();
    }
    isWeapon(): this is WeaponItemComponent {
        abstract();
    }
    isWearable(): this is WearableItemComponent {
        abstract();
    }
    isArmor(): this is ArmorItemComponent {
        abstract();
    }
}

export class CooldownItemComponent extends ItemComponent { }

export class ArmorItemComponent extends ItemComponent { }

export class DiggerItemComponent extends ItemComponent {
    mineBlock(itemStack:ItemStack, block:Block, int1:number, int2:number, int3:number, actor:Actor): boolean {
        abstract();
    }
}

export class DurabilityItemComponent extends ItemComponent {
    getDamageChance(int:number): number {
        abstract();
    }
}

export class DisplayNameItemComponent extends ItemComponent { }

export class DyePowderItemComponent extends ItemComponent { }

export class EntityPlacerItemComponent extends ItemComponent {
    positionAndRotateActor(actor:Actor, vec3:Vec3, unsignedInt8:number, _vec3:Vec3, blockLegacy:BlockLegacy): void {
        abstract();
    }
    setActorCustomName(actor:Actor, itemStack:ItemStack): void {
        abstract();
    }
}

export class FoodItemComponent extends ItemComponent {
    canAlwaysEat(): boolean {
        abstract();
    }
    getUsingConvertsToItemDescriptor(): ItemDescriptor {
        abstract();
    }
}

export class FuelItemComponent extends ItemComponent { }

export class IconItemComponent extends ItemComponent { }

export class KnockbackResistanceItemComponent extends ItemComponent {
    getProtectionValue(): number {
        abstract();
    }
}

export class OnUseItemComponent extends ItemComponent { }

export class PlanterItemComponent extends ItemComponent { }

export class ProjectileItemComponent extends ItemComponent {
    getShootDir(player:Player, float:number): Vec3 {
        abstract();
    }
    shootProjectile(blockSource:BlockSource, vec3:Vec3, _vec3:Vec3, float:number, player:Player): Actor {
        abstract();
    }
}

export class RecordItemComponent extends ItemComponent {
    getAlias(): string {
        abstract();
    }
}

export class RenderOffsetsItemComponent extends ItemComponent { }

export class RepairableItemComponent extends ItemComponent {
    handleItemRepair(itemStackBase:ItemStackBase, _itemStackBase:ItemStackBase): number {
        abstract();
    }
}

export class ShooterItemComponent extends ItemComponent { }

export class ThrowableItemComponent extends ItemComponent {
    getLaunchPower(int1: number, int2: number, int3: number): number {
        abstract();
    }
}

export class WeaponItemComponent extends ItemComponent { }

export class WearableItemComponent extends ItemComponent { }
