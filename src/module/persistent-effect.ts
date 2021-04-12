import { EffectData } from "../types/item";

export const typeImages = {
    bleed: "systems/pf2e/icons/spells/blade-barrier.jpg",
    piercing: "systems/pf2e/icons/spells/savor-the-sting.jpg",
    bludgeoning: "systems/pf2e/icons/equipment/weapons/bola.jpg",
    slashing: "systems/pf2e/icons/equipment/weapons/cutlass.png",
    fire: "systems/pf2e/icons/spells/flaming-sphere.jpg",
    acid: "systems/pf2e/icons/spells/blister.jpg",
    cold: "systems/pf2e/icons/spells/chilling-spray.jpg",
    electricity: "systems/pf2e/icons/spells/chain-lightning.jpg",
    sonic: "systems/pf2e/icons/spells/cry-of-destruction.jpg",
    force: "systems/pf2e/icons/spells/magic-missile.jpg",
    mental: "systems/pf2e/icons/spells/modify-memory.jpg",
    poison: "systems/pf2e/icons/spells/acidic-burst.jpg",
    lawful: "systems/pf2e/icons/equipment/adventuring-gear/merchant-scale.jpg",
    chaotic: "systems/pf2e/icons/spells/dinosaur-form.jpg",
    good: "systems/pf2e/icons/spells/angelic-wings.jpg",
    evil: "systems/pf2e/icons/spells/daemonic-pact.jpg",
    positive: "systems/pf2e/icons/spells/moment-of-renewal.jpg",
    negative: "systems/pf2e/icons/spells/grim-tendrils.jpg",
};

export type DamageType = keyof typeof typeImages;

/**
 * Data involving persistent damage
 */
export interface PersistentData {
    damageType: DamageType;
    value: string;
    dc: number;
}

/**
 * All possible persistent data types that may exist due to old versions.
 * These properties are nudged into new ones.
 */
interface PersistentDataOld extends PersistentData {
    type?: Capitalize<DamageType> | "bleeding";
}

/**
 * Retrieves persistent data values from item data if exists.
 * Also handles "migrations" in a way.
 */
export function getPersistentData(itemData: {
    flags: { persistent?: PersistentDataOld };
}): PersistentData {
    const data = itemData.flags.persistent;
    if (data) {
        // Ensure damage type is suitable for the latest version
        let damageType = data.damageType ?? data.type?.toLowerCase();
        if (damageType === "bleeding") damageType = "bleed";

        return {
            damageType,
            dc: data.dc ?? 15,
            value: data.value,
        };
    }
}

/**
 * Creates the persistent effect data that can be used to create an item.
 * @param damageType
 * @param value
 * @returns
 */
export function createPersistentEffect(persistent: PersistentData): Partial<EffectData> {
    return {
        type: "effect",
        name: "Persistent Damage",
        data: {
            description: {
                value: "Persistent Damage from some source. Deals damage at the end of each turn and needs a check to remove.",
            },
            duration: {
                expiry: "turn-end",
                unit: "unlimited",
                value: 0,
                sustained: false,
            },
            rules: [
                {
                    key: "PF2E.RuleElement.PersistentDamage",
                    ...persistent,
                },
                { key: "PF2E.RuleElement.TokenEffectIcon" },
            ],
        },
        flags: { persistent },
        img: typeImages[persistent.damageType],
    };
}
