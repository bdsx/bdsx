import { abstract } from "../common";
import { NativeClass } from "../nativeclass";
import { Wrapper } from "../pointer";
import { Actor } from "./actor";
import { Block, BlockLegacy, BlockSource } from "./block";
import { Vec3 } from "./blockpos";
import { HashedString } from "./hashedstring";
import { ItemDescriptor, ItemStack, ItemStackBase } from "./inventory";
import { CompoundTag } from "./nbt";
import { Player } from "./player";

export class ItemComponent extends NativeClass {
    getIdentifier(): string | null {
        if ((this as any)._getIdentifier) return (this as any)._getIdentifier().str;
        return null;
    }
    buildNetworkTag(): CompoundTag | null {
        if ((this as any)._buildNetworkTag) return (this as any)._buildNetworkTag();
        return null;
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
    isKnockbackResistance(): this is PlanterItemComponent {
        abstract();
    }
    isOnUse(): this is ProjectileItemComponent {
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

export class CooldownItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class ArmorItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class DiggerItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    mineBlock(itemStack:ItemStack, block:Block, int1:number, int2:number, int3:number, actor:Actor): boolean {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class DurabilityItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    getDamageChance(int:number): number {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class DisplayNameItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class DyePowderItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class EntityPlacerItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    positionAndRotateActor(actor:Actor, vec3:Vec3, unsignedInt8:number, _vec3:Vec3, blockLegacy:BlockLegacy): void {
        abstract();
    }
    setActorCustomName(actor:Actor, itemStack:ItemStack): void {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class FoodItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    canAlwaysEat(): boolean {
        abstract();
    }
    getUsingConvertsToItemDescriptor(): ItemDescriptor {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class FuelItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class IconItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class KnockbackResistanceItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    getProtectionValue(): number {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class OnUseItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class PlanterItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class ProjectileItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    getShootDir(player:Player, float:number): Vec3 {
        abstract();
    }
    shootProjectile(blockSource:BlockSource, vec3:Vec3, _vec3:Vec3, float:number, player:Player): Actor {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class RecordItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    getAlias(): string {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class RenderOffsetsItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class RepairableItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    handleItemRepair(itemStackBase:ItemStackBase, _itemStackBase:ItemStackBase): number {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class ShooterItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class ThrowableItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    getLaunchPower(int1: number, int2: number, int3: number): number {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class WeaponItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}

export class WearableItemComponent extends ItemComponent {
    protected _getIdentifier(): HashedString {
        abstract();
    }
    protected _buildNetworkTag(): CompoundTag {
        abstract();
    }
}