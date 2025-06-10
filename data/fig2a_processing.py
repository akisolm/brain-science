import pandas as pd
import json

def main():
    df = pd.read_csv('ArticleLevelData.csv')
    # df.columns ['eidsp', 'DOIp', 'JournalIDp', 'Cp', 'Yp', 'Kp', 'Zp', 'KR1', 'KR2', 'KR3', 'KR4', 'SA1', 'SA2', 'SA3', 'SA4', 'SA5', 'SA6', 'CIP1', 'CIP2','CIP3', 'CIP4', 'CIP5', 'CIP6', 'CIP7', 'CIP8', 'CIP9','IRegionRefinedp', 'XRegionp', 'MeanZJp', 'XSAp', 'XCIPp', 'NEUROSHORTXSAp', 'NEUROSHORTXCIPp', 'NEUROLONGXSAp', 'NEUROLONGXCIPp', 'IYBRAINPROJECTp', 'NRegp', 'NSAp', 'NCIPp', 'nMeSHMain']
    df['Zp_0']= df['Zp'].apply(lambda x: 1 if x >= 0 else 0)
    df.groupby(['Yp','Zp_0']).count()

    # 0. 对大于4的类别进行截断
    df['NSAp']  = df['NSAp'].clip(upper=4)
    df['NCIPp'] = df['NCIPp'].clip(upper=4)

    # 1. 定义年份和类别范围
    years    = sorted(df['Yp'].unique())
    z_groups = [0, 1]            # 0 = 低引用, 1 = 高引用
    sa_vals  = [1, 2, 3, 4]      # 只保留前4个SA类别
    cip_vals = [1, 2, 3, 4]      # 只保留前4个CIP类别

    # 2. 统计每年每引用组总论文数
    totals = df.groupby(['Yp','Zp_0']).size().rename('total').reset_index()

    # 3. 统计“恰好 n 个 SA”文章数
    counts_sa = (
        df.groupby(['Yp','Zp_0','NSAp'])
        .size()
        .rename('count')
        .reset_index()
    )

    # 4. 补齐所有 (Yp, Zp_0, n) 组合，计算 frac
    idx_sa = pd.MultiIndex.from_product([years, z_groups, sa_vals], names=['Yp','Zp_0','NSAp'])
    sa_df = (
        pd.DataFrame(index=idx_sa).reset_index()
        .merge(counts_sa, how='left', on=['Yp','Zp_0','NSAp'])
        .merge(totals,    how='left', on=['Yp','Zp_0'])
        .fillna({'count':0,'total':0})
    )
    sa_df['frac'] = sa_df['count'] / sa_df['total']

    # 5. 同理处理 CIP
    counts_cip = (
        df.groupby(['Yp','Zp_0','NCIPp'])
        .size()
        .rename('count')
        .reset_index()
    )
    idx_cip = pd.MultiIndex.from_product([years, z_groups, cip_vals], names=['Yp','Zp_0','NCIPp'])
    cip_df = (
        pd.DataFrame(index=idx_cip).reset_index()
        .merge(counts_cip, how='left', on=['Yp','Zp_0','NCIPp'])
        .merge(totals,    how='left', on=['Yp','Zp_0'])
        .fillna({'count':0,'total':0})
    )
    cip_df['frac'] = cip_df['count'] / cip_df['total']

    # 6. 导出为 JSON 供 D3.js 使用
    def df_to_d3_json(df, key_col, prefix, vals):
        result = []
        for (year, z), grp in df.groupby(['Yp','Zp_0']):
            obj = {'year': int(year), 'z': int(z)}
            for n in vals:
                key = f"{prefix}_{n}"
                obj[key] = float(grp.loc[grp[key_col]==n, 'frac'])
            result.append(obj)
        return result

    sa_json  = df_to_d3_json(sa_df,  'NSAp',  'sa',  sa_vals)
    cip_json = df_to_d3_json(cip_df, 'NCIPp', 'cip', cip_vals)

    # 将 JSON 保存到文件
    with open('sa_data.json',  'w') as f: json.dump(sa_json,  f, indent=2)
    with open('cip_data.json', 'w') as f: json.dump(cip_json, f, indent=2)

if __name__ == "__main__":
    main()