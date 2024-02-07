import { abstract } from "../common";
import { NativeClass, nativeClass, nativeField } from "../nativeclass";
import { bool_t, int64_as_float_t } from "../nativetype";
import { Actor } from "./actor";
import { Block, BlockSource } from "./block";
import { Vec3 } from "./blockpos";
import { HashedString } from "./hashedstring";
import type { ItemDescriptor, ItemStack, ItemStackBase } from "./inventory";
import { CompoundTag } from "./nbt";
import type { Player } from "./player";

export namespace cereal {
    @nativeClass()
    export class ReflectionCtx extends NativeClass {
        @nativeField(int64_as_float_t)
        u: int64_as_float_t;
    }
}

export class ItemComponent extends NativeClass {
    static getIdentifier(): HashedString {
        abstract();
    }
    buildNetworkTag(u?: cereal.ReflectionCtx): CompoundTag {
        abstract();
    }
    initializeFromNetwork(tag: CompoundTag, u?: cereal.ReflectionCtx): bool_t {
        abstract();
    }
    isCooldown(): this is CooldownItemComponent {
        return this instanceof CooldownItemComponent;
    }
    isDurability(): this is DurabilityItemComponent {
        return this instanceof DurabilityItemComponent;
    }
    isDigger(): this is DiggerItemComponent {
        return this instanceof DiggerItemComponent;
    }
    isDisplayName(): this is DisplayNameItemComponent {
        return this instanceof DisplayNameItemComponent;
    }
    isDyePowder(): this is DyePowderItemComponent {
        return this instanceof DyePowderItemComponent;
    }
    isEntityPlacer(): this is EntityPlacerItemComponent {
        return this instanceof EntityPlacerItemComponent;
    }
    isFood(): this is FoodItemComponent {
        return this instanceof FoodItemComponent;
    }
    isFuel(): this is FuelItemComponent {
        return this instanceof FuelItemComponent;
    }
    isIcon(): this is IconItemComponent {
        return this instanceof IconItemComponent;
    }
    isKnockbackResistance(): this is KnockbackResistanceItemComponent {
        return this instanceof KnockbackResistanceItemComponent;
    }
    isOnUse(): this is OnUseItemComponent {
        return this instanceof OnUseItemComponent;
    }
    isPlanter(): this is PlanterItemComponent {
        return this instanceof PlanterItemComponent;
    }
    isProjectile(): this is ProjectileItemComponent {
        return this instanceof ProjectileItemComponent;
    }
    isRecord(): this is RecordItemComponent {
        return this instanceof RecordItemComponent;
    }
    isRenderOffsets(): this is RenderOffsetsItemComponent {
        return this instanceof RenderOffsetsItemComponent;
    }
    isRepairable(): this is RepairableItemComponent {
        return this instanceof RepairableItemComponent;
    }
    isShooter(): this is ShooterItemComponent {
        return this instanceof ShooterItemComponent;
    }
    isThrowable(): this is ThrowableItemComponent {
        return this instanceof ThrowableItemComponent;
    }
    isWeapon(): this is WeaponItemComponent {
        return this instanceof WeaponItemComponent;
    }
    isWearable(): this is WearableItemComponent {
        return this instanceof WearableItemComponent;
    }
    isArmor(): this is ArmorItemComponent {
        return this instanceof ArmorItemComponent;
    }
}

export class CooldownItemComponent extends ItemComponent {}

export class ArmorItemComponent extends ItemComponent {}

export class DiggerItemComponent extends ItemComponent {
    mineBlock(itemStack: ItemStack, block: Block, int1: number, int2: number, int3: number, actor: Actor): boolean {
        abstract();
    }
}

export class DurabilityItemComponent extends ItemComponent {
    getDamageChance(int: number): number {
        const damageChangeRange = this.getUint32(0x14);
        let unk = this.getUint32(0x18);
        unk -= damageChangeRange;
        unk = (unk / int + 1) | 0;
        return unk + damageChangeRange;
    }
}

export class DisplayNameItemComponent extends ItemComponent {}

/**
 * @deprecated removed
 */
export class DyePowderItemComponent extends ItemComponent {}

export class EntityPlacerItemComponent extends ItemComponent {
    // TODO: removed method, need to implement
    // positionAndRotateActor(actor: Actor, vec3: Vec3, unsignedInt8: number, _vec3: Vec3, blockLegacy: BlockLegacy): void {
    //     abstract();
    // }
    setActorCustomName(actor: Actor, itemStack: ItemStack): void {
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

export class FuelItemComponent extends ItemComponent {}

export class IconItemComponent extends ItemComponent {}

/**
 * @deprecated removed
 */
export class KnockbackResistanceItemComponent extends ItemComponent {
    getProtectionValue(): number {
        abstract();
    }
}

export class OnUseItemComponent extends ItemComponent {}

export class PlanterItemComponent extends ItemComponent {}

export class ProjectileItemComponent extends ItemComponent {
    getShootDir(player: Player, float: number): Vec3 {
        abstract();
    }
    shootProjectile(blockSource: BlockSource, vec3: Vec3, _vec3: Vec3, float: number, player: Player): Actor {
        abstract();
    }
}

export class RecordItemComponent extends ItemComponent {
    // removed
    // getAlias(): string {
    //     abstract();
    // }
}

export class RenderOffsetsItemComponent extends ItemComponent {}

/**
 * TODO: implement enum
 */
type RepairItemResult = number;

export class RepairableItemComponent extends ItemComponent {
    handleItemRepair(itemStackBase: ItemStackBase, _itemStackBase: ItemStackBase): RepairItemResult {
        abstract();
    }
}

export class ShooterItemComponent extends ItemComponent {}

export class ThrowableItemComponent extends ItemComponent {
    getLaunchPower(int1: number, int2: number, int3: number): number {
        abstract();
    }
}

export class WeaponItemComponent extends ItemComponent {}

export class WearableItemComponent extends ItemComponent {}
