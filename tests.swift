
import Foundation
import CoreGraphics

/// 街マップの配置状態 CityMapState を検証する。
///
/// この型の価値は「`placements` と `occupancy` が常に同期している」不変条件にあるので、
/// 各テストは戻り値だけでなく**両方の内部表現**を突き合わせる。
/// 失敗する操作については「false を返す」ではなく「状態が一切変わらない」ことまで検証する
/// （部分適用が残ると、ドラッグ中断のたびに街が少しずつ壊れていくため）。
final class CityMapStateTests: XCTestCase {


    // MARK: - ヘルパ

    /// 決定的な UUID（テストの失敗メッセージを読めるようにするため連番から作る）。
    /// 書式は `%ld`（`Int` は 64bit なので `%d` だと下位32bitしか読まれない）。
    private func uuid(_ n: Int) -> UUID {
        UUID(uuidString: String(format: "00000000-0000-0000-0000-%012ld", n))!
    }

    private let t0 = Date(timeIntervalSince1970: 1_700_000_000)

    private func coord(_ x: Int, _ y: Int) -> CityGridCoord {
        CityGridCoord(x: x, y: y)
    }

    // MARK: - 空きセルへの配置

    func testEmptyStateHasNoPlacements() {
        let state = CityMapState()
        XCTAssertTrue(state.placements.isEmpty)
        XCTAssertTrue(state.occupancy.isEmpty)
        XCTAssertTrue(state.isFree(coord(0, 0)))
    }

    func testPlaceOnFreeCellSucceeds() {
        var state = CityMapState()
        XCTAssertTrue(state.place(id: uuid(1), at: coord(2, 3), date: t0))
        XCTAssertEqual(state.placements.count, 1)
        XCTAssertEqual(state.placements.first?.id, uuid(1))
        XCTAssertEqual(state.placements.first?.coord, coord(2, 3))
        XCTAssertEqual(state.placements.first?.placedDate, t0)
    }

    func testPlaceUpdatesOccupancyIndex() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(2, 3), date: t0)
        XCTAssertEqual(state.occupancy[coord(2, 3)], uuid(1))
        XCTAssertFalse(state.isFree(coord(2, 3)), "置いたセルは占有になる")
        XCTAssertTrue(state.isFree(coord(3, 2)), "別のセルは空きのまま")
    }

    func testCoordOfReturnsPlacedCoord() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(-4, 7), date: t0)
        XCTAssertEqual(state.coord(of: uuid(1)), coord(-4, 7))
        XCTAssertNil(state.coord(of: uuid(2)), "未配置の建築は座標を持たない")
    }

    // MARK: - 占有セルへの配置は失敗し、状態が変わらない

    func testPlaceOnOccupiedCellFails() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(0, 0), date: t0)
        XCTAssertFalse(state.place(id: uuid(2), at: coord(0, 0), date: t0))
    }

    func testPlaceOnOccupiedCellLeavesStateUnchanged() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(0, 0), date: t0)
        let before = state

        state.place(id: uuid(2), at: coord(0, 0), date: t0.addingTimeInterval(60))

        XCTAssertEqual(state, before, "失敗した配置は placements にも occupancy にも痕跡を残さない")
    }

    // MARK: - 同じ id の二重配置

    func testPlaceSameIDTwiceFails() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(0, 0), date: t0)
        XCTAssertFalse(state.place(id: uuid(1), at: coord(5, 5), date: t0),
                       "配置済みの建築は place では動かせない（移動は move を使う）")
    }

    func testPlaceSameIDTwiceLeavesStateUnchanged() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(0, 0), date: t0)
        let before = state

        state.place(id: uuid(1), at: coord(5, 5), date: t0.addingTimeInterval(60))

        XCTAssertEqual(state, before, "1つの建築が街に2つ生えない")
        XCTAssertTrue(state.isFree(coord(5, 5)))
    }

    // MARK: - 移動

    func testMoveToFreeCellUpdatesCoord() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(0, 0), date: t0)
        XCTAssertTrue(state.move(id: uuid(1), to: coord(3, 1)))
        XCTAssertEqual(state.coord(of: uuid(1)), coord(3, 1))
    }

    func testMoveReleasesPreviousCell() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(0, 0), date: t0)
        state.move(id: uuid(1), to: coord(3, 1))
        XCTAssertNil(state.occupancy[coord(0, 0)], "移動元は空きに戻る")
        XCTAssertEqual(state.occupancy[coord(3, 1)], uuid(1))
    }

    func testMoveDoesNotLeakOccupancyEntries() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(0, 0), date: t0)
        state.move(id: uuid(1), to: coord(3, 1))
        XCTAssertEqual(state.occupancy.count, 1,
                       "移動で索引が増殖しない（移動元の解放漏れの検出）")
    }

    func testMoveFreesPreviousCellForAnotherBuilding() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(0, 0), date: t0)
        state.move(id: uuid(1), to: coord(3, 1))
        XCTAssertTrue(state.place(id: uuid(2), at: coord(0, 0), date: t0),
                      "移動で空いたセルは実際に再利用できる（索引だけ消えて未反映、を防ぐ）")
    }

    func testMoveKeepsPlacedDate() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(0, 0), date: t0)
        state.move(id: uuid(1), to: coord(3, 1))
        XCTAssertEqual(state.placements.first?.placedDate, t0,
                       "移動は「街に加わった日時」を書き換えない")
    }

    func testMoveToOccupiedCellFails() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(0, 0), date: t0)
        state.place(id: uuid(2), at: coord(1, 1), date: t0)
        XCTAssertFalse(state.move(id: uuid(1), to: coord(1, 1)))
    }

    func testMoveToOccupiedCellLeavesStateUnchanged() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(0, 0), date: t0)
        state.place(id: uuid(2), at: coord(1, 1), date: t0)
        let before = state

        state.move(id: uuid(1), to: coord(1, 1))

        XCTAssertEqual(state, before, "移動に失敗しても移動元は解放されない")
    }

    func testMoveToOwnCellSucceedsWithoutChange() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(2, 2), date: t0)
        let before = state

        XCTAssertTrue(state.move(id: uuid(1), to: coord(2, 2)),
                      "元の位置で離した操作は失敗扱いにしない")
        XCTAssertEqual(state, before)
    }

    func testMoveUnknownIDFails() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(0, 0), date: t0)
        let before = state

        XCTAssertFalse(state.move(id: uuid(9), to: coord(4, 4)))
        XCTAssertEqual(state, before)
    }

    // MARK: - 削除

    func testRemoveFreesCell() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(2, 3), date: t0)
        XCTAssertTrue(state.remove(id: uuid(1)))
        XCTAssertTrue(state.isFree(coord(2, 3)), "外したセルは再び置けるようになる")
    }

    func testRemoveDropsPlacement() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(2, 3), date: t0)
        state.place(id: uuid(2), at: coord(4, 5), date: t0)
        state.remove(id: uuid(1))
        XCTAssertEqual(state.placements.map(\.id), [uuid(2)])
        XCTAssertNil(state.occupancy[coord(2, 3)])
        XCTAssertEqual(state.occupancy.count, 1)
    }

    func testRemoveThenPlaceSameCellSucceeds() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(2, 3), date: t0)
        state.remove(id: uuid(1))
        XCTAssertTrue(state.place(id: uuid(2), at: coord(2, 3), date: t0))
    }

    func testRemoveClearsCoordLookup() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(2, 3), date: t0)
        state.remove(id: uuid(1))
        XCTAssertNil(state.coord(of: uuid(1)), "外した建築は座標を持たない＝トレイ側の未配置判定と一致する")
    }

    func testRemovedBuildingCanBePlacedAgain() {
        // 「しまう」→ 別の場所へ置き直す、という本機能の主要フローそのもの。
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(2, 3), date: t0)
        state.remove(id: uuid(1))
        XCTAssertTrue(state.place(id: uuid(1), at: coord(7, 8), date: t0.addingTimeInterval(60)))
        XCTAssertEqual(state.coord(of: uuid(1)), coord(7, 8))
    }

    func testRePlacingRemovedBuildingRecordsNewDate() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(2, 3), date: t0)
        state.remove(id: uuid(1))
        state.place(id: uuid(1), at: coord(7, 8), date: t0.addingTimeInterval(60))
        XCTAssertEqual(state.placements.first?.placedDate, t0.addingTimeInterval(60),
                       "一度街から外して置き直したときは「加わった日時」も新しくなる（move との違い）")
    }

    func testRemoveUnknownIDFails() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(0, 0), date: t0)
        let before = state

        XCTAssertFalse(state.remove(id: uuid(9)))
        XCTAssertEqual(state, before)
    }

    // MARK: - init の自己修復（重複は先勝ち）

    func testInitBuildsOccupancyFromPlacements() {
        let state = CityMapState(placements: [
            PlacedBuilding(id: uuid(1), coord: coord(0, 0), placedDate: t0),
            PlacedBuilding(id: uuid(2), coord: coord(1, 2), placedDate: t0)
        ])
        XCTAssertEqual(state.occupancy, [coord(0, 0): uuid(1), coord(1, 2): uuid(2)])
    }

    func testInitDropsDuplicateCoordKeepingFirst() {
        let state = CityMapState(placements: [
            PlacedBuilding(id: uuid(1), coord: coord(3, 3), placedDate: t0),
            PlacedBuilding(id: uuid(2), coord: coord(3, 3), placedDate: t0.addingTimeInterval(60))
        ])
        XCTAssertEqual(state.placements.map(\.id), [uuid(1)], "同じ座標は先に現れた方だけ残す")
        XCTAssertEqual(state.occupancy[coord(3, 3)], uuid(1))
    }

    func testInitDropsDuplicateIDKeepingFirst() {
        let state = CityMapState(placements: [
            PlacedBuilding(id: uuid(1), coord: coord(0, 0), placedDate: t0),
            PlacedBuilding(id: uuid(1), coord: coord(9, 9), placedDate: t0.addingTimeInterval(60))
        ])
        XCTAssertEqual(state.placements.map(\.coord), [coord(0, 0)],
                       "同じ建築が2箇所にある壊れたデータは先勝ちで1件に畳む")
        XCTAssertTrue(state.isFree(coord(9, 9)))
    }

    func testInitKeepsValidPlacementsAroundDuplicates() {
        let state = CityMapState(placements: [
            PlacedBuilding(id: uuid(1), coord: coord(0, 0), placedDate: t0),
            PlacedBuilding(id: uuid(2), coord: coord(0, 0), placedDate: t0),
            PlacedBuilding(id: uuid(3), coord: coord(1, 0), placedDate: t0)
        ])
        XCTAssertEqual(state.placements.map(\.id), [uuid(1), uuid(3)],
                       "1件の重複が後続の正常な配置を巻き込まない")
    }

    func testInitDroppedBuildingBecomesPlaceableAgain() {
        // 重複で捨てられた側は「未配置」に戻るだけ＝トレイから改めて置き直せる。
        // （旧名 ...AcceptsFreedCell は「セルが空く」という誤解を招く。空くのは id の方。）
        var state = CityMapState(placements: [
            PlacedBuilding(id: uuid(1), coord: coord(0, 0), placedDate: t0),
            PlacedBuilding(id: uuid(2), coord: coord(0, 0), placedDate: t0)
        ])
        XCTAssertTrue(state.place(id: uuid(2), at: coord(1, 1), date: t0))
        XCTAssertEqual(state.occupancy[coord(0, 0)], uuid(1), "勝った側の占有は動かない")
        XCTAssertEqual(state.placements.count, 2)
    }

    func testInitDropsCoordThatWouldOverflowDrawOrder() {
        // depth(= x + y) が Int を溢れる座標。放置すると drawOrder の比較でプロセスが停止し、
        // 「マップを開くと必ず落ちる」状態を永続データが再現し続けることになる。
        let state = CityMapState(placements: [
            PlacedBuilding(id: uuid(1), coord: CityGridCoord(x: Int.max, y: 1), placedDate: t0),
            PlacedBuilding(id: uuid(2), coord: coord(0, 0), placedDate: t0)
        ])
        XCTAssertEqual(state.placements.map(\.id), [uuid(2)], "範囲外の配置だけを捨て、残りは生かす")
    }

    func testDrawOrderDoesNotTrapOnCorruptedCoords() {
        let state = CityMapState(placements: [
            PlacedBuilding(id: uuid(1), coord: CityGridCoord(x: Int.max, y: Int.max), placedDate: t0),
            PlacedBuilding(id: uuid(2), coord: CityGridCoord(x: Int.min, y: Int.min), placedDate: t0),
            PlacedBuilding(id: uuid(3), coord: coord(1, 1), placedDate: t0)
        ])
        XCTAssertEqual(state.drawOrder.map(\.id), [uuid(3)],
                       "壊れた永続データからでも並べ替えが完走する（回帰: 算術オーバーフローで停止していた）")
    }

    func testInitRecoversLaterValidPlacementOfSameBuilding() {
        // 範囲外で捨てた建築の id は「使用済み」にしない。同じ建築のまともな配置が
        // 後ろにあれば拾い直せる＝1件の破損で建築を失わない。
        let state = CityMapState(placements: [
            PlacedBuilding(id: uuid(1), coord: CityGridCoord(x: Int.max, y: 1), placedDate: t0),
            PlacedBuilding(id: uuid(1), coord: coord(2, 2), placedDate: t0)
        ])
        XCTAssertEqual(state.coord(of: uuid(1)), coord(2, 2))
    }

    // MARK: - 座標の表現範囲（境界値）

    func testPlaceAcceptsCoordAtRangeLimit() {
        var state = CityMapState()
        XCTAssertTrue(state.place(id: uuid(1), at: coord(1_000_000_000, -1_000_000_000), date: t0),
                      "上限ちょうどは有効（格子側のクランプ幅と一致していること）")
    }

    func testPlaceRejectsCoordBeyondRangeLimit() {
        var state = CityMapState()
        let before = state
        XCTAssertFalse(state.place(id: uuid(1), at: coord(1_000_000_001, 0), date: t0))
        XCTAssertEqual(state, before)
    }

    func testMoveRejectsCoordBeyondRangeLimit() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(0, 0), date: t0)
        let before = state

        XCTAssertFalse(state.move(id: uuid(1), to: coord(0, -1_000_000_001)))
        XCTAssertEqual(state, before, "拒否した移動で移動元が解放されない")
    }

    // MARK: - 描画順（奥 → 手前）

    func testDrawOrderIsBackToFront() {
        var state = CityMapState()
        // 意図的にばらばらの順で置く（配置順ではなく depth 順に並ぶことの確認）。
        state.place(id: uuid(1), at: coord(2, 0), date: t0) // depth 2
        state.place(id: uuid(2), at: coord(1, 0), date: t0) // depth 1
        state.place(id: uuid(3), at: coord(0, 1), date: t0) // depth 1
        state.place(id: uuid(4), at: coord(0, 0), date: t0) // depth 0

        XCTAssertEqual(state.drawOrder.map(\.coord),
                       [coord(0, 0), coord(0, 1), coord(1, 0), coord(2, 0)],
                       "depth 昇順、同 depth では x 昇順")
    }

    func testDrawOrderHandlesNegativeCoords() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(0, 0), date: t0)   // depth 0
        state.place(id: uuid(2), at: coord(-2, -3), date: t0) // depth -5
        XCTAssertEqual(state.drawOrder.map(\.id), [uuid(2), uuid(1)],
                       "原点より奥（負の depth）も正しく奥側に描かれる")
    }

    func testDrawOrderDoesNotMutatePlacementsOrder() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(2, 0), date: t0)
        state.place(id: uuid(2), at: coord(0, 0), date: t0)
        _ = state.drawOrder
        XCTAssertEqual(state.placements.map(\.id), [uuid(1), uuid(2)],
                       "placements は配置された順のまま")
    }

    // MARK: - 外接範囲

    func testBoundsIsNilWhenEmpty() {
        XCTAssertNil(CityMapState().bounds)
    }

    func testBoundsIsNilAfterRemovingLastPlacement() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(0, 0), date: t0)
        state.remove(id: uuid(1))
        XCTAssertNil(state.bounds, "最後の1件を外したら範囲は消える")
    }

    func testBoundsOfSinglePlacementIsThatCoord() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(4, -2), date: t0)
        XCTAssertEqual(state.bounds?.min, coord(4, -2))
        XCTAssertEqual(state.bounds?.max, coord(4, -2))
    }

    func testBoundsIsComponentWiseBoundingBox() {
        var state = CityMapState()
        state.place(id: uuid(1), at: coord(-3, 5), date: t0)
        state.place(id: uuid(2), at: coord(4, -2), date: t0)
        state.place(id: uuid(3), at: coord(0, 0), date: t0)

        // x と y を独立に取る外接矩形。Comparable（depth 順）の最小・最大ではない。
        XCTAssertEqual(state.bounds?.min, coord(-3, -2))
        XCTAssertEqual(state.bounds?.max, coord(4, 5))
    }
}
